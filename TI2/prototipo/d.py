#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from pathlib import Path
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from concurrent.futures import ThreadPoolExecutor
import tempfile

# =========================
# Configurações
# =========================
PASTA_CODIGO_DEFAULT = Path("codigo")
EXTENSOES_PERMITIDAS = {".js",".css",".py",".ts",".rs"}
SKIP_DIRS = {"node_modules", "dist", "build", "__pycache__", ".git", ".next", ".vercel", ".cache"}

# =========================
# Utilitários
# =========================
def should_skip(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)

def ler_linhas(p: Path):
    try:
        with p.open("r", encoding="utf-8", errors="ignore") as f:
            return f.readlines()
    except Exception as e:
        return [f"/* ERRO ao ler {p.name}: {e} */\n"]

def normalize_eol(s: str) -> str:
    return s if s.endswith("\n") else (s + "\n")

# =========================
# App
# =========================
class FileJoinerApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Juntar Conteúdo de Arquivos (.js/.py)")
        self.geometry("1000x700")
        self.minsize(900, 600)

        # Estado
        self.base_dir = tk.StringVar(value=PASTA_CODIGO_DEFAULT.as_posix())
        self.search_text = tk.StringVar(value="")
        self.insert_separators = tk.BooleanVar(value=False)
        
        # Seleção persistente
        self.selected_files = set()  # Set de caminhos absolutos
        self.tree_nodes = {}  # Mapeia item_id -> caminho completo
        
        # Para carregamento assíncrono
        self.executor = ThreadPoolExecutor(max_workers=2)
        self.loading = False
        
        # Estado da árvore
        self.expanded_folders = set()
        self.exporting = False  # Flag para evitar múltiplas exportações
        
        self._build_ui()
        self._load_tree_async()

    # ---------- UI ----------
    def _build_ui(self):
        # Top bar
        top = ttk.Frame(self, padding=(10, 10))
        top.pack(fill="x")

        ttk.Label(top, text="Pasta base:").grid(row=0, column=0, sticky="w")
        self.entry_dir = ttk.Entry(top, textvariable=self.base_dir)
        self.entry_dir.grid(row=0, column=1, sticky="we", padx=(6, 6))
        btn_browse = ttk.Button(top, text="Selecionar…", command=self._pick_base)
        btn_browse.grid(row=0, column=2, sticky="w")
        btn_reload = ttk.Button(top, text="Recarregar", command=self._load_tree_async)
        btn_reload.grid(row=0, column=3, sticky="w", padx=(6, 0))

        top.columnconfigure(1, weight=1)

        # Controls bar
        ctr = ttk.Frame(self, padding=(10, 0))
        ctr.pack(fill="x", pady=(6, 0))

        ttk.Label(ctr, text="Filtro:").grid(row=0, column=0, sticky="w")
        ent_filter = ttk.Entry(ctr, textvariable=self.search_text)
        ent_filter.grid(row=0, column=1, sticky="we", padx=(6, 6))
        ent_filter.bind("<KeyRelease>", self._on_filter_change)

        btn_expand_all = ttk.Button(ctr, text="Expandir tudo", command=self._expand_all)
        btn_expand_all.grid(row=0, column=2, sticky="w", padx=(0, 6))
        
        btn_collapse_all = ttk.Button(ctr, text="Recolher tudo", command=self._collapse_all)
        btn_collapse_all.grid(row=0, column=3, sticky="w", padx=(0, 10))

        btn_select_all = ttk.Button(ctr, text="Selecionar tudo", command=self._select_all_visible)
        btn_select_all.grid(row=0, column=4, sticky="w", padx=(0, 6))
        
        btn_clear = ttk.Button(ctr, text="Limpar seleção", command=self._clear_selection)
        btn_clear.grid(row=0, column=5, sticky="w")

        ctr.columnconfigure(1, weight=1)

        # Tree header
        head = ttk.Frame(self, padding=(10, 6))
        head.pack(fill="x")
        self.label_count = ttk.Label(head, text="Carregando...")
        self.label_count.pack(side="left")
        
        # Contador de selecionados
        self.label_selected = ttk.Label(head, text="0 selecionado(s)")
        self.label_selected.pack(side="right")

        # Treeview com scrollbars
        tree_frame = ttk.Frame(self, padding=(10, 0))
        tree_frame.pack(fill="both", expand=True)

        # Scrollbar vertical
        vsb = ttk.Scrollbar(tree_frame, orient="vertical")
        vsb.pack(side="right", fill="y")
        
        # Scrollbar horizontal
        hsb = ttk.Scrollbar(tree_frame, orient="horizontal")
        hsb.pack(side="bottom", fill="x")

        # Treeview
        self.tree = ttk.Treeview(
            tree_frame, 
            yscrollcommand=vsb.set,
            xscrollcommand=hsb.set,
            selectmode="extended",
            show="tree"
        )
        
        # Configura colunas
        self.tree["columns"] = ("path",)
        self.tree.column("#0", width=300, minwidth=200)
        self.tree.column("path", width=400, minwidth=200)
        
        vsb.config(command=self.tree.yview)
        hsb.config(command=self.tree.xview)
        
        self.tree.pack(fill="both", expand=True)
        
        # Bind eventos
        self.tree.bind("<Button-1>", self._on_single_click)
        self.tree.bind("<Double-1>", self._on_double_click)
        self.tree.bind("<space>", self._toggle_selection)
        self.tree.bind("<Control-a>", lambda e: self._select_all_visible())
        self.tree.bind("<<TreeviewOpen>>", self._on_folder_open)
        self.tree.bind("<<TreeviewClose>>", self._on_folder_close)
        
        # Checkbox visual (usando caracteres Unicode)
        self.CHECKED = "☑"
        self.UNCHECKED = "☐"
        self.FOLDER_OPEN = "📂"
        self.FOLDER_CLOSED = "📁"
        self.FILE_ICON = "📄"

        # Bottom bar
        bottom = ttk.Frame(self, padding=(10, 10))
        bottom.pack(fill="x")

        sep_chk = ttk.Checkbutton(bottom, text="Inserir separador com o nome do arquivo", 
                                 variable=self.insert_separators)
        sep_chk.pack(side="left")

        # Frame para botões de exportação
        export_frame = ttk.Frame(bottom)
        export_frame.pack(side="right")
        
        self.btn_export_txt = ttk.Button(export_frame, text="Gerar TXT", command=self._export_txt)
        self.btn_export_txt.pack(side="left", padx=(0, 6))
        
        self.btn_export_copy = ttk.Button(export_frame, text="Copiar para Clipboard", command=self._export_clipboard)
        self.btn_export_copy.pack(side="left")

        self._apply_style()

    def _apply_style(self):
        style = ttk.Style()
        try:
            style.theme_use("clam")
        except:
            pass
        
        # Estilo para a treeview
        style.configure("Treeview", 
                       font=("Segoe UI", 10),
                       rowheight=25)
        
        # Configura cores para seleção
        self.tree.tag_configure("selected", background="#e3f2fd")
        self.tree.tag_configure("folder", foreground="#1a73e8")
        self.tree.tag_configure("file", foreground="#333333")

    # ---------- Manipulação de Cliques ----------
    def _on_single_click(self, event):
        """Clique único: seleciona/deseleciona apenas se clicar no checkbox/ícone"""
        region = self.tree.identify("region", event.x, event.y)
        
        if region == "tree":
            item_id = self.tree.identify_row(event.y)
            if not item_id:
                return
            
            # Verifica se clicou no ícone/texto do item (não na seta de expandir)
            column = self.tree.identify_column(event.x)
            element = self.tree.identify_element(event.x, event.y)
            
            # Só seleciona se clicou diretamente no texto ou ícone do item
            if column == "#0" and element == "text":
                path = self.tree_nodes.get(item_id, "")
                path_obj = Path(path)
                
                if path_obj.is_file():
                    self._toggle_item_selection(item_id)
    
    def _on_double_click(self, event):
        """Clique duplo: expande/recolhe pastas, seleciona arquivos"""
        region = self.tree.identify("region", event.x, event.y)
        
        if region == "tree":
            item_id = self.tree.identify_row(event.y)
            if not item_id:
                return
            
            path = self.tree_nodes.get(item_id, "")
            path_obj = Path(path)
            
            if path_obj.is_dir():
                # Alterna expansão da pasta
                if self.tree.item(item_id, "open"):
                    self.tree.item(item_id, open=False)
                else:
                    self.tree.item(item_id, open=True)

    def _on_folder_open(self, event):
        """Atualiza ícone da pasta quando expande"""
        item_id = self.tree.focus()
        if item_id and item_id in self.tree_nodes:
            path = self.tree_nodes[item_id]
            if Path(path).is_dir():
                current_text = self.tree.item(item_id, "text")
                new_text = current_text.replace(self.FOLDER_CLOSED, self.FOLDER_OPEN)
                self.tree.item(item_id, text=new_text)
                self.expanded_folders.add(item_id)

    def _on_folder_close(self, event):
        """Atualiza ícone da pasta quando recolhe"""
        item_id = self.tree.focus()
        if item_id and item_id in self.tree_nodes:
            path = self.tree_nodes[item_id]
            if Path(path).is_dir():
                current_text = self.tree.item(item_id, "text")
                new_text = current_text.replace(self.FOLDER_OPEN, self.FOLDER_CLOSED)
                self.tree.item(item_id, text=new_text)
                self.expanded_folders.discard(item_id)

    def _toggle_selection(self, event):
        """Alterna seleção com barra de espaço"""
        item_id = self.tree.focus()
        if item_id:
            self._toggle_item_selection(item_id)
            return "break"

    def _toggle_item_selection(self, item_id):
        """Alterna a seleção de um item"""
        if item_id not in self.tree_nodes:
            return
        
        path = self.tree_nodes[item_id]
        path_obj = Path(path)
        
        if path_obj.is_dir():
            # Seleciona/deseleciona todos os arquivos da pasta
            files_in_folder = self._get_files_in_folder(item_id)
            
            all_selected = all(f in self.selected_files for f in files_in_folder) if files_in_folder else False
            
            if all_selected:
                for f in files_in_folder:
                    self.selected_files.discard(f)
            else:
                for f in files_in_folder:
                    self.selected_files.add(f)
            
            self._update_children_visual(item_id)
        else:
            # Alterna arquivo individual
            if path in self.selected_files:
                self.selected_files.discard(path)
                current_text = self.tree.item(item_id, "text")
                text_parts = current_text.split(" ", 1)
                if len(text_parts) > 1:
                    self.tree.item(item_id, text=f"{self.UNCHECKED} {text_parts[1]}")
                self.tree.item(item_id, tags=("file",))
            else:
                self.selected_files.add(path)
                current_text = self.tree.item(item_id, "text")
                text_parts = current_text.split(" ", 1)
                if len(text_parts) > 1:
                    self.tree.item(item_id, text=f"{self.CHECKED} {text_parts[1]}")
                self.tree.item(item_id, tags=("selected",))
        
        self._update_count_label()

    def _get_files_in_folder(self, folder_id):
        """Retorna todos os arquivos dentro de uma pasta"""
        files = []
        for child_id in self.tree.get_children(folder_id):
            child_path = self.tree_nodes[child_id]
            if Path(child_path).is_file():
                files.append(child_path)
            else:
                files.extend(self._get_files_in_folder(child_id))
        return files

    def _update_children_visual(self, parent_id):
        """Atualiza visual dos itens filhos"""
        for child_id in self.tree.get_children(parent_id):
            child_path = self.tree_nodes[child_id]
            if Path(child_path).is_file():
                is_selected = child_path in self.selected_files
                icon = self.CHECKED if is_selected else self.UNCHECKED
                current_text = self.tree.item(child_id, "text")
                text_parts = current_text.split(" ", 1)
                if len(text_parts) > 1:
                    self.tree.item(child_id, text=f"{icon} {text_parts[1]}")
                if is_selected:
                    self.tree.item(child_id, tags=("selected",))
                else:
                    self.tree.item(child_id, tags=("file",))
            else:
                self._update_children_visual(child_id)

    # ---------- Carregamento da Árvore ----------
    def _load_tree_async(self):
        """Carrega a estrutura de diretórios em background"""
        if self.loading:
            return
        
        self.loading = True
        self.label_count.configure(text="Carregando árvore de arquivos...")
        
        base = Path(self.base_dir.get())
        
        def build_tree_in_background():
            """Constrói a estrutura de diretórios"""
            tree_structure = {}
            
            for root, dirs, files in os.walk(str(base)):
                dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
                
                root_path = Path(root)
                
                valid_files = []
                for file in files:
                    file_path = root_path / file
                    if file_path.suffix.lower() in EXTENSOES_PERMITIDAS:
                        valid_files.append(file_path)
                
                if valid_files or dirs:
                    tree_structure[str(root_path)] = {
                        'files': valid_files,
                        'dirs': [root_path / d for d in dirs]
                    }
            
            return tree_structure
        
        def on_complete(future):
            try:
                tree_structure = future.result()
                self._populate_tree(tree_structure, base)
                self.loading = False
                self._update_count_label()
            except Exception as e:
                self.loading = False
                self.label_count.configure(text=f"Erro: {e}")
                messagebox.showerror("Erro", f"Falha ao carregar arquivos:\n{e}")
        
        future = self.executor.submit(build_tree_in_background)
        future.add_done_callback(on_complete)

    def _populate_tree(self, structure, base):
        """Popula a treeview com a estrutura carregada"""
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        self.tree_nodes.clear()
        self.selected_files.clear()
        self.expanded_folders.clear()
        
        root_id = self.tree.insert("", "end", text=f"{self.FOLDER_OPEN} {base.name}", 
                                  values=(str(base),), open=True)
        self.tree_nodes[root_id] = str(base)
        self.tree.item(root_id, tags=("folder",))
        
        self._populate_recursive(root_id, base, structure)

    def _populate_recursive(self, parent_id, parent_path, structure):
        """Popula recursivamente os nós da árvore"""
        path_key = str(parent_path)
        if path_key not in structure:
            return
        
        data = structure[path_key]
        
        # Adiciona subpastas
        for dir_path in sorted(data['dirs'], key=lambda p: p.name.lower()):
            dir_id = self.tree.insert(
                parent_id, "end", 
                text=f"{self.FOLDER_CLOSED} {dir_path.name}",
                values=(str(dir_path),),
                open=False
            )
            self.tree_nodes[dir_id] = str(dir_path)
            self.tree.item(dir_id, tags=("folder",))
            self._populate_recursive(dir_id, dir_path, structure)
        
        # Adiciona arquivos
        for file_path in sorted(data['files'], key=lambda p: p.name.lower()):
            file_key = str(file_path.resolve())
            is_selected = file_key in self.selected_files
            
            icon = self.CHECKED if is_selected else self.UNCHECKED
            file_id = self.tree.insert(
                parent_id, "end",
                text=f"{icon} {file_path.name}",
                values=(str(file_path.relative_to(Path(self.base_dir.get()))),),
                open=False
            )
            self.tree_nodes[file_id] = file_key
            self.tree.item(file_id, tags=("file", "selected" if is_selected else "file"))

    def _select_all_visible(self):
        """Seleciona todos os arquivos visíveis na árvore"""
        self._select_all_recursive("")
        self._update_count_label()

    def _select_all_recursive(self, parent_id):
        """Seleciona recursivamente todos os arquivos"""
        for child_id in self.tree.get_children(parent_id):
            child_path = self.tree_nodes.get(child_id, "")
            if Path(child_path).is_file():
                self.selected_files.add(child_path)
                current_text = self.tree.item(child_id, "text")
                text_parts = current_text.split(" ", 1)
                if len(text_parts) > 1:
                    self.tree.item(child_id, text=f"{self.CHECKED} {text_parts[1]}")
                self.tree.item(child_id, tags=("selected",))
            else:
                self._select_all_recursive(child_id)

    def _clear_selection(self):
        """Limpa toda a seleção"""
        self.selected_files.clear()
        self._clear_selection_recursive("")
        self._update_count_label()

    def _clear_selection_recursive(self, parent_id):
        """Limpa seleção recursivamente"""
        for child_id in self.tree.get_children(parent_id):
            child_path = self.tree_nodes.get(child_id, "")
            if Path(child_path).is_file():
                current_text = self.tree.item(child_id, "text")
                text_parts = current_text.split(" ", 1)
                if len(text_parts) > 1:
                    self.tree.item(child_id, text=f"{self.UNCHECKED} {text_parts[1]}")
                self.tree.item(child_id, tags=("file",))
            else:
                self._clear_selection_recursive(child_id)

    def _expand_all(self):
        """Expande todas as pastas"""
        for item_id in self.tree_nodes:
            path = self.tree_nodes[item_id]
            if Path(path).is_dir():
                self.tree.item(item_id, open=True)
                current_text = self.tree.item(item_id, "text")
                self.tree.item(item_id, text=current_text.replace(self.FOLDER_CLOSED, self.FOLDER_OPEN))
                self.expanded_folders.add(item_id)

    def _collapse_all(self):
        """Recolhe todas as pastas (exceto raiz)"""
        for item_id in self.tree.get_children(""):
            self._collapse_recursive(item_id)

    def _collapse_recursive(self, item_id):
        """Recolhe recursivamente"""
        for child_id in self.tree.get_children(item_id):
            self._collapse_recursive(child_id)
        
        if self.tree_nodes.get(item_id, ""):
            path = self.tree_nodes[item_id]
            if Path(path).is_dir() and self.tree.parent(item_id):
                self.tree.item(item_id, open=False)
                current_text = self.tree.item(item_id, "text")
                self.tree.item(item_id, text=current_text.replace(self.FOLDER_OPEN, self.FOLDER_CLOSED))
                self.expanded_folders.discard(item_id)

    def _on_filter_change(self, event):
        """Filtra arquivos na árvore"""
        if hasattr(self, '_filter_timer'):
            self.after_cancel(self._filter_timer)
        self._filter_timer = self.after(200, self._apply_filter)

    def _apply_filter(self):
        """Aplica filtro na árvore"""
        txt = self.search_text.get().strip().lower()
        
        if not txt:
            self._show_all_items_recursive("")
        else:
            self._filter_items_recursive("", txt)
        
        self._update_count_label()

    def _show_all_items_recursive(self, parent_id):
        """Mostra todos os itens"""
        for child_id in self.tree.get_children(parent_id):
            self.tree.reattach(child_id, parent_id, "end")
            self._show_all_items_recursive(child_id)

    def _filter_items_recursive(self, parent_id, txt):
        """Filtra itens recursivamente"""
        for child_id in self.tree.get_children(parent_id):
            child_path = self.tree_nodes.get(child_id, "")
            path_obj = Path(child_path)
            
            if path_obj.is_file():
                if txt in path_obj.name.lower():
                    self.tree.reattach(child_id, parent_id, "end")
                else:
                    self.tree.detach(child_id)
            else:
                self._filter_items_recursive(child_id, txt)
                if self.tree.get_children(child_id):
                    self.tree.reattach(child_id, parent_id, "end")
                    self.tree.item(child_id, open=True)
                else:
                    self.tree.detach(child_id)

    def _pick_base(self):
        """Seleciona pasta base"""
        d = filedialog.askdirectory(initialdir=self.base_dir.get() or ".", title="Escolher pasta base")
        if d:
            self.base_dir.set(d.replace("\\", "/"))
            self._load_tree_async()

    def _get_selected_files(self):
        """Retorna lista de arquivos selecionados (apenas os que existem)"""
        files = []
        for path_str in self.selected_files:
            path = Path(path_str)
            if path.exists() and path.is_file():
                files.append(path)
        return sorted(files, key=lambda p: str(p))

    def _update_count_label(self):
        """Atualiza contadores"""
        total_files = sum(1 for path in self.tree_nodes.values() if Path(path).is_file())
        selected_count = len(self.selected_files)
        
        if self.loading:
            self.label_count.configure(text="Carregando...")
        else:
            self.label_count.configure(text=f"{total_files} arquivos")
        
        self.label_selected.configure(text=f"{selected_count} selecionado(s)")

    # ---------- Exportação (CORRIGIDO) ----------
    def _generate_content(self, selecionados):
        """Gera o conteúdo concatenado dos arquivos"""
        usar_sep = self.insert_separators.get()
        total_linhas = 0
        content_parts = []
        
        try:
            base_path = Path(self.base_dir.get()).resolve()
            
            for p in selecionados:
                if not p.exists():
                    continue
                
                if usar_sep:
                    try:
                        rel_path = p.relative_to(base_path)
                    except ValueError:
                        rel_path = p
                    content_parts.append(f"\n/* ==== INÍCIO: {rel_path.as_posix()} ==== */\n")
                
                # Lê o arquivo
                linhas = ler_linhas(p)
                for L in linhas:
                    content_parts.append(normalize_eol(L))
                    total_linhas += 1
                
                if usar_sep:
                    content_parts.append(f"/* ==== FIM: {rel_path.as_posix()} ==== */\n")
            
            return "".join(content_parts), total_linhas
        except Exception as e:
            raise Exception(f"Erro ao gerar conteúdo: {e}")

    def _export_txt(self):
        """Exporta para arquivo TXT"""
        if self.exporting:
            return
        
        selecionados = self._get_selected_files()
        if not selecionados:
            messagebox.showwarning("Nada selecionado", "Selecione pelo menos um arquivo.")
            return
        
        # Diálogo para salvar
        fp = filedialog.asksaveasfilename(
            title="Salvar TXT concatenado",
            defaultextension=".txt",
            filetypes=[("Arquivo de texto", "*.txt"), ("Todos", "*.*")],
            initialfile="concatenado.txt"
        )
        if not fp:
            return
        
        self.exporting = True
        self.btn_export_txt.configure(state="disabled", text="Gerando...")
        
        def export_in_background():
            try:
                content, total_linhas = self._generate_content(selecionados)
                
                # Salva de forma segura (escreve em arquivo temporário primeiro)
                temp_file = None
                try:
                    # Cria arquivo temporário no mesmo diretório
                    temp_fd, temp_path = tempfile.mkstemp(
                        suffix=".tmp", 
                        dir=os.path.dirname(fp) or "."
                    )
                    temp_file = os.fdopen(temp_fd, "w", encoding="utf-8")
                    temp_file.write(content)
                    temp_file.close()
                    
                    # Substitui o arquivo original
                    if os.path.exists(fp):
                        os.remove(fp)
                    os.rename(temp_path, fp)
                    
                    return True, total_linhas, fp
                except Exception as e:
                    if temp_file:
                        temp_file.close()
                    if temp_path and os.path.exists(temp_path):
                        os.remove(temp_path)
                    raise e
                
            except Exception as e:
                return False, str(e), None
        
        def on_export_complete(future):
            self.exporting = False
            self.btn_export_txt.configure(state="normal", text="Gerar TXT")
            
            try:
                success, result, filepath = future.result()
                if success:
                    messagebox.showinfo(
                        "Concluído", 
                        f"Arquivo gerado com sucesso!\n\n"
                        f"• {result} linhas escritas\n"
                        f"• {len(selecionados)} arquivos processados\n"
                        f"• Salvo em:\n{filepath}"
                    )
                else:
                    messagebox.showerror("Erro ao salvar", result)
            except Exception as e:
                messagebox.showerror("Erro", f"Falha na exportação: {e}")
        
        future = self.executor.submit(export_in_background)
        future.add_done_callback(on_export_complete)

    def _export_clipboard(self):
        """Copia conteúdo para a área de transferência"""
        if self.exporting:
            return
        
        selecionados = self._get_selected_files()
        if not selecionados:
            messagebox.showwarning("Nada selecionado", "Selecione pelo menos um arquivo.")
            return
        
        self.exporting = True
        self.btn_export_copy.configure(state="disabled", text="Copiando...")
        
        def copy_in_background():
            try:
                content, total_linhas = self._generate_content(selecionados)
                
                # Copia para clipboard
                self.clipboard_clear()
                self.clipboard_append(content)
                
                return True, total_linhas
            except Exception as e:
                return False, str(e)
        
        def on_copy_complete(future):
            self.exporting = False
            self.btn_export_copy.configure(state="normal", text="Copiar para Clipboard")
            
            try:
                success, result = future.result()
                if success:
                    messagebox.showinfo(
                        "Concluído", 
                        f"Conteúdo copiado para a área de transferência!\n\n"
                        f"• {result} linhas\n"
                        f"• {len(selecionados)} arquivos processados"
                    )
                else:
                    messagebox.showerror("Erro ao copiar", result)
            except Exception as e:
                messagebox.showerror("Erro", f"Falha ao copiar: {e}")
        
        # Executa em background
        future = self.executor.submit(copy_in_background)
        future.add_done_callback(on_copy_complete)


if __name__ == "__main__":
    app = FileJoinerApp()
    app.mainloop()
