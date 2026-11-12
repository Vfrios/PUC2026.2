import React, { useState, useEffect, useRef } from "react";
import { api } from "../../api.js";
import { Bell, Edit2, Heart, MessageCircle, MoreVertical, Plus, Search, Send, Share2, Trash2, Users, X } from "lucide-react";
import { Button, CATS, Chip, ActionSheet, compartilhar, EmptyState, ErrorBox, fieldBox, fieldInput, FotoPerfil, INK, INK_SOFT, Loading, SectionTitle, timeAgo, TopBar, useApiData } from "../../shared/shared.jsx";

const card = { background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 };
const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 16,
};
const modalBox = {
  background: "#fff",
  borderRadius: 18,
  width: "100%",
  maxWidth: 420,
  padding: 20,
  boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
};

/* ---- COMUNIDADES ---- */
const CATEGORIAS_COMUNIDADE = { GERAL: "Geral", ...Object.fromEntries(Object.entries(CATS).map(([k, v]) => [k, v.label])) };

function ModalComunidade({ aberto, titulo, initialData, onClose, onSalvar }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("GERAL");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!aberto) return undefined;
    const focoAnterior = document.activeElement;
    const fecharComEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.removeEventListener("keydown", fecharComEscape);
      focoAnterior?.focus?.();
    };
  }, [aberto]);

  useEffect(() => {
    if (aberto) {
      setNome(initialData?.nome || "");
      setDescricao(initialData?.descricao || "");
      setCategoria(initialData?.categoria || "GERAL");
      setErro("");
      setSalvando(false);
    }
  }, [aberto, initialData]);

  if (!aberto) return null;

  const salvar = async (e) => {
    e?.preventDefault?.();
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErro("Informe o nome da comunidade.");
      return;
    }
    if (nomeLimpo.length > 80) {
      setErro("O nome pode ter no máximo 80 caracteres.");
      return;
    }
    if (descricao.length > 500) {
      setErro("A descrição pode ter no máximo 500 caracteres.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await onSalvar({ nome: nomeLimpo, descricao: descricao.trim(), categoria });
      onClose();
    } catch (err) {
      setErro(err.message || "Erro ao salvar comunidade.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={modalBackdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label={titulo}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>{titulo}</div>
          <button type="button" onClick={onClose} aria-label="Fechar" style={{ background: "none", border: "none", cursor: "pointer", color: INK_SOFT, padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {erro && <div role="alert" style={{ background: "#FDEAE8", color: "#C0392B", padding: "8px 12px", borderRadius: 8, fontSize: 12, marginBottom: 12 }}>{erro}</div>}

        <form onSubmit={salvar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label htmlFor="comunidade-nome" style={{ fontSize: 12, fontWeight: 600, color: INK, display: "block", marginBottom: 4 }}>
              Nome da comunidade <span style={{ color: "#C0392B" }}>*</span>
            </label>
            <input
              id="comunidade-nome"
              type="text"
              maxLength={80}
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Vizinhos Solidários Centro"
              style={{ ...fieldInput, width: "100%", boxSizing: "border-box", border: "1px solid #EDEBE1", borderRadius: 10, padding: "9px 12px" }}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="comunidade-categoria" style={{ fontSize: 12, fontWeight: 600, color: INK, display: "block", marginBottom: 4 }}>
              Categoria
            </label>
            <select
              id="comunidade-categoria"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              style={{ ...fieldInput, width: "100%", boxSizing: "border-box", border: "1px solid #EDEBE1", borderRadius: 10, padding: "9px 12px", background: "#fff" }}
            >
              {Object.entries(CATEGORIAS_COMUNIDADE).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="comunidade-descricao" style={{ fontSize: 12, fontWeight: 600, color: INK, display: "block", marginBottom: 4 }}>
              Descrição (opcional)
            </label>
            <textarea
              id="comunidade-descricao"
              rows={3}
              maxLength={500}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descreva o propósito da comunidade, região ou regras simples..."
              style={{ ...fieldInput, width: "100%", boxSizing: "border-box", border: "1px solid #EDEBE1", borderRadius: 10, padding: "9px 12px", resize: "none" }}
            />
            <div style={{ fontSize: 10.5, color: INK_SOFT, textAlign: "right", marginTop: 2 }}>{descricao.length}/500</div>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Button type="button" variant="ghost" small onClick={onClose} disabled={salvando}>Cancelar</Button>
            <Button type="submit" variant="primary" small loading={salvando}>Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MuralComunidade({ comunidade, go, notify, usuario, onVoltar, onAtualizada, onExcluida }) {
  // TODO: adicionar "Carregar anteriores" quando o backend expuser cursor/offset de paginação.
  const { loading, error, data: posts, reload } = useApiData(() => api.mensagensComunidade(comunidade.id), [comunidade.id]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [lista, setLista] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [processandoParticipacao, setProcessandoParticipacao] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (posts) {
      // Garante ordenação cronológica ascendente
      const ordenados = [...posts].sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm));
      setLista(ordenados);
    }
  }, [posts]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lista.length]);

  const enviar = async (e) => {
    e?.preventDefault?.();
    const textoLimpo = texto.trim();
    if (!textoLimpo || enviando) return;

    if (!comunidade.participando) {
      notify("Participe da comunidade para enviar mensagens.");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const otimista = {
      id: tempId,
      autorId: usuario?.id,
      autorNome: usuario?.nome || "Você",
      autorFotoUrl: usuario?.fotoUrl,
      texto: textoLimpo,
      criadoEm: new Date().toISOString(),
      apoios: 0,
      apoiei: false,
      pendente: true,
    };

    setLista(l => [...l, otimista]);
    setTexto("");
    setEnviando(true);

    try {
      const confirmada = await api.enviarMensagemComunidade(comunidade.id, textoLimpo);
      setLista(l => l.map(m => m.id === tempId ? confirmada : m));
      onAtualizada?.({ ...comunidade, totalPosts: (comunidade.totalPosts || 0) + 1 });
    } catch (err) {
      setLista(l => l.filter(m => m.id !== tempId));
      notify(err.message || "Não foi possível enviar a mensagem.");
    } finally {
      setEnviando(false);
    }
  };

  const alternarParticipacao = async () => {
    if (comunidade.participando && !window.confirm(`Deseja sair da comunidade ${comunidade.nome}?`)) return;
    setProcessandoParticipacao(true);
    try {
      const atualizada = comunidade.participando
        ? await api.sairComunidade(comunidade.id)
        : await api.participarComunidade(comunidade.id);
      onAtualizada?.(atualizada);
      notify(atualizada.participando ? `Você entrou em ${comunidade.nome}!` : `Você saiu de ${comunidade.nome}.`);
    } catch (err) {
      notify(err.message || "Não foi possível atualizar sua participação.");
    } finally {
      setProcessandoParticipacao(false);
    }
  };

  const apoiar = async (post) => {
    if (post.pendente) return;
    const otimista = { ...post, apoiei: !post.apoiei, apoios: post.apoios + (post.apoiei ? -1 : 1) };
    setLista(l => l.map(p => p.id === post.id ? otimista : p));
    try {
      const atualizado = await api.apoiarPost(comunidade.id, post.id);
      setLista(l => l.map(p => p.id === post.id ? atualizado : p));
    } catch (err) {
      setLista(l => l.map(p => p.id === post.id ? post : p));
      notify(err.message || "Não foi possível apoiar.");
    }
  };

  const salvarEdicao = async (dados) => {
    const atualizada = await api.editarComunidade(comunidade.id, dados);
    onAtualizada?.(atualizada);
    notify("Comunidade atualizada com sucesso!");
  };

  const excluirComunidade = async () => {
    if (!window.confirm(`Deseja realmente excluir a comunidade "${comunidade.nome}"? Todas as mensagens serão apagadas permanentemente.`)) {
      return;
    }
    try {
      await api.excluirComunidade(comunidade.id);
      notify(`Comunidade "${comunidade.nome}" excluída.`);
      onExcluida?.(comunidade.id);
      onVoltar();
    } catch (err) {
      notify(err.message || "Não foi possível excluir a comunidade.");
    }
  };

  const ehCriador = comunidade.ehCriador || (usuario?.id && comunidade.criadorId === usuario.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <TopBar
        title={comunidade.nome}
        onBack={onVoltar}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              aria-label="Compartilhar comunidade"
              onClick={() => compartilhar({ titulo: comunidade.nome, texto: `Participe da comunidade ${comunidade.nome} no Reviva!`, url: window.location.origin }, notify)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", color: INK }}
            >
              <Share2 size={18} />
            </button>
            {ehCriador && (
              <button
                type="button"
                aria-label="Opções da comunidade"
                onClick={() => setMenuAberto(true)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", color: INK }}
              >
                <MoreVertical size={18} />
              </button>
            )}
          </div>
        }
      />

      {/* Cabeçalho da Comunidade com resumo e botão de participação */}
      <div style={{ padding: "0 16px 10px", borderBottom: "1px solid #EDEBE1", background: "#fff", flexShrink: 0 }}>
        {comunidade.descricao && (
          <div style={{ fontSize: 12.5, color: INK_SOFT, lineHeight: 1.45, marginBottom: 4 }}>
            {comunidade.descricao}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
          <div style={{ fontSize: 11.5, color: INK_SOFT }}>
            {comunidade.totalMembros} {comunidade.totalMembros === 1 ? "membro" : "membros"} · {CATEGORIAS_COMUNIDADE[comunidade.categoria] || "Geral"}
            {comunidade.cidade ? ` · ${comunidade.cidade}` : ""}
            {ehCriador && <span style={{ marginLeft: 6, color: "var(--role-primary-dark)", fontWeight: 700 }}>· Criador</span>}
          </div>
          <Button
            small
            variant={comunidade.participando ? "ghost" : "primary"}
            loading={processandoParticipacao}
            onClick={alternarParticipacao}
          >
            {comunidade.participando ? "Sair" : "Participar"}
          </Button>
        </div>
      </div>

      {/* Histórico de Mensagens (ordem ascendente) */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <Loading label="Carregando mensagens..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}

        {!loading && !error && lista.length === 0 && (
          <div style={{ margin: "auto 0", padding: "24px 0" }}>
            <EmptyState Icon={MessageCircle} text="Nenhuma mensagem ainda. Seja o primeiro a participar." />
          </div>
        )}

        {lista.map(p => {
          const mine = usuario?.id && p.autorId === usuario.id;
          const horario = p.criadoEm
            ? new Date(p.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
            : "";

          return (
            <div
              key={p.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignSelf: mine ? "flex-end" : "flex-start",
                maxWidth: "85%",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, alignSelf: mine ? "flex-end" : "flex-start" }}>
                {!mine && <FotoPerfil usuario={{ nome: p.autorNome, fotoUrl: p.autorFotoUrl }} size={20} />}
                <span
                  style={{ fontSize: 11, fontWeight: 700, color: INK, cursor: p.autorId ? "pointer" : "default" }}
                  onClick={() => p.autorId && go?.("perfilPublico", { usuarioId: p.autorId })}
                >
                  {mine ? "Você" : (p.autorNome || "Participante")}
                </span>
                {horario && <span style={{ fontSize: 10, color: INK_SOFT }}>{horario}</span>}
              </div>

              <div
                style={{
                  background: mine ? "var(--role-primary)" : "#fff",
                  color: mine ? "#fff" : INK,
                  border: mine ? "none" : "1px solid #EDEBE1",
                  borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  padding: "10px 14px",
                  fontSize: 13,
                  lineHeight: 1.45,
                  whiteSpace: "pre-wrap",
                  boxShadow: mine ? "0 2px 8px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                {p.texto}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: mine ? "flex-end" : "flex-start", gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => apoiar(p)}
                  aria-label={`${p.apoios} apoios`}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    fontSize: 11,
                    color: p.apoiei ? "#C0392B" : INK_SOFT,
                    display: "flex",
                    gap: 3,
                    alignItems: "center",
                    cursor: "pointer",
                    fontWeight: p.apoiei ? 700 : 500,
                  }}
                >
                  <Heart size={12} fill={p.apoiei ? "#C0392B" : "none"} />
                  <span>{p.apoios}</span>
                </button>
                {p.pendente && <span style={{ fontSize: 10, color: INK_SOFT, fontStyle: "italic" }}>Enviando...</span>}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Rodapé: Input e Envio de Mensagem */}
      <div style={{ borderTop: "1px solid #EDEBE1", background: "#FAFAF4", padding: "10px 14px", flexShrink: 0 }}>
        {comunidade.participando ? (
          <form onSubmit={enviar} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <textarea
              value={texto}
              rows={2}
              maxLength={500}
              onChange={e => setTexto(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar();
                }
              }}
              placeholder="Escreva uma mensagem na comunidade..."
              aria-label="Escreva uma mensagem na comunidade"
              style={{
                ...fieldInput,
                flex: 1,
                border: "1px solid #EDEBE1",
                borderRadius: 20,
                padding: "9px 14px",
                background: "#fff",
                resize: "none",
              }}
            />
            <button
              type="submit"
              disabled={!texto.trim() || enviando}
              aria-label="Enviar mensagem"
              style={{
                border: "none",
                background: "var(--role-primary)",
                color: "#fff",
                width: 38,
                height: 38,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: !texto.trim() || enviando ? "not-allowed" : "pointer",
                opacity: !texto.trim() || enviando ? 0.5 : 1,
                flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "6px 0", fontSize: 12, color: INK_SOFT }}>
            Participe da comunidade para interagir e enviar mensagens no chat.
          </div>
        )}
      </div>

      {/* Menu de Ações do Criador */}
      <ActionSheet
        open={menuAberto}
        title={comunidade.nome}
        onClose={() => setMenuAberto(false)}
        actions={[
          { label: "Editar nome e descrição", Icon: Edit2, onClick: () => { setMenuAberto(false); setModalEditarAberto(true); } },
          { label: "Excluir comunidade", Icon: Trash2, danger: true, onClick: () => { setMenuAberto(false); excluirComunidade(); } },
        ]}
      />

      {/* Modal de Edição */}
      <ModalComunidade
        aberto={modalEditarAberto}
        titulo="Editar comunidade"
        initialData={comunidade}
        onClose={() => setModalEditarAberto(false)}
        onSalvar={salvarEdicao}
      />
    </div>
  );
}

function Comunidades({ go, notify, usuario }) {
  const { loading, error, data, reload } = useApiData(() => api.comunidades(), [usuario?.id]);
  const [comunidades, setComunidades] = useState([]);
  const [termoInput, setTermoInput] = useState("");
  const [termoDebounced, setTermoDebounced] = useState("");
  const [categoria, setCategoria] = useState("");
  const [minhaRegiao, setMinhaRegiao] = useState(false);
  const [soMinhas, setSoMinhas] = useState(false);
  const [processando, setProcessando] = useState(null);
  const [aberta, setAberta] = useState(null);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);

  useEffect(() => {
    if (data) setComunidades(data);
  }, [data]);

  // Debounce curto na busca (280ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setTermoDebounced(termoInput);
    }, 280);
    return () => clearTimeout(handler);
  }, [termoInput]);

  const atualizarComunidade = (c) => {
    setComunidades(lista => lista.map(x => x.id === c.id ? c : x));
    setAberta(a => a && a.id === c.id ? c : a);
  };

  const removerComunidade = (id) => {
    setComunidades(lista => lista.filter(x => x.id !== id));
    if (aberta && aberta.id === id) {
      setAberta(null);
    }
  };

  const alternarParticipacao = async (c) => {
    if (c.participando && !window.confirm(`Deseja sair da comunidade ${c.nome}?`)) return;
    setProcessando(c.id);
    try {
      const atualizada = c.participando
        ? await api.sairComunidade(c.id)
        : await api.participarComunidade(c.id);
      atualizarComunidade(atualizada);
      notify(atualizada.participando ? `Você entrou em ${c.nome}!` : `Você saiu de ${c.nome}.`);
    } catch (e) {
      notify(e.message || "Não foi possível atualizar sua participação.");
    } finally {
      setProcessando(null);
    }
  };

  const criarNovaComunidade = async (dados) => {
    const nova = await api.criarComunidade(dados);
    setComunidades(prev => [nova, ...prev]);
    notify(`Comunidade "${nova.nome}" criada com sucesso!`);
    setAberta(nova);
  };

  const limparFiltros = () => {
    setTermoInput("");
    setTermoDebounced("");
    setCategoria("");
    setMinhaRegiao(false);
    setSoMinhas(false);
  };

  const categoriasPresentes = [...new Set(comunidades.map(c => c.categoria).filter(Boolean))];
  const busca = termoDebounced.trim().toLowerCase();

  const filtradas = comunidades.filter(c => {
    if (categoria && c.categoria !== categoria) return false;
    if (soMinhas && !c.participando) return false;
    if (minhaRegiao && usuario?.cidade && (c.cidade || "").toLowerCase() !== usuario.cidade.toLowerCase()) return false;
    if (busca) {
      const matches = [c.nome, c.descricao, c.bairroReferencia, c.cidade].some(v => (v || "").toLowerCase().includes(busca));
      if (!matches) return false;
    }
    return true;
  });

  const temFiltroAtivo = Boolean(termoInput || categoria || minhaRegiao || soMinhas);

  if (aberta) {
    return (
      <MuralComunidade
        comunidade={aberta}
        go={go}
        notify={notify}
        usuario={usuario}
        onVoltar={() => setAberta(null)}
        onAtualizada={atualizarComunidade}
        onExcluida={removerComunidade}
      />
    );
  }

  return (
    <div>
      <TopBar
        title="Comunidades"
        onBack={() => go(-1)}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              aria-label="Criar nova comunidade"
              onClick={() => setModalCriarAberto(true)}
              style={{
                background: "var(--role-soft)",
                border: "none",
                borderRadius: 8,
                padding: "6px 8px",
                display: "flex",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
                color: "var(--role-primary-dark)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <Plus size={16} />
              <span>Nova</span>
            </button>
            <button
              type="button"
              aria-label="Notificações"
              onClick={() => go("notificacoes")}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", color: INK }}
            >
              <Bell size={18} />
            </button>
          </div>
        }
      />

      <div style={{ padding: "0 20px 24px" }}>
        {/* Barra de Busca com Debounce */}
        <div style={fieldBox}>
          <Search size={16} color={INK_SOFT} />
          <input
            value={termoInput}
            onChange={e => setTermoInput(e.target.value)}
            placeholder="Buscar por nome, bairro ou cidade"
            aria-label="Buscar comunidades por nome, bairro ou cidade"
            style={fieldInput}
          />
          {termoInput && (
            <button
              type="button"
              aria-label="Limpar texto de busca"
              onClick={() => { setTermoInput(""); setTermoDebounced(""); }}
              style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
            >
              <X size={15} color={INK_SOFT} />
            </button>
          )}
        </div>

        {/* Chips de Filtro */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 0 4px" }}>
          <Chip active={soMinhas} onClick={() => setSoMinhas(v => !v)}>Minhas</Chip>
          {usuario?.cidade && <Chip active={minhaRegiao} onClick={() => setMinhaRegiao(v => !v)}>📍 {usuario.cidade}</Chip>}
          <Chip active={!categoria && !soMinhas} onClick={() => { setCategoria(""); setSoMinhas(false); }}>Todas</Chip>
          {categoriasPresentes.map(k => (
            <Chip key={k} active={categoria === k} onClick={() => setCategoria(categoria === k ? "" : k)}>
              {CATEGORIAS_COMUNIDADE[k] || k}
            </Chip>
          ))}
        </div>

        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}

        {/* Estado vazio corrigido: só "Nenhuma com esses filtros" quando a busca/filtro não bater */}
        {!loading && !error && filtradas.length === 0 && (
          <div style={{ marginTop: 20 }}>
            {comunidades.length === 0 ? (
              <div>
                <EmptyState Icon={Users} text="Ainda não há comunidades cadastradas." />
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <Button small variant="primary" icon={Plus} onClick={() => setModalCriarAberto(true)}>
                    Criar a primeira comunidade
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <EmptyState Icon={Users} text="Nenhuma comunidade com esses filtros." />
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <Button small variant="ghost" onClick={limparFiltros}>
                    Limpar filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lista de Comunidades */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          {filtradas.map(c => {
            const ehCriador = c.ehCriador || (usuario?.id && c.criadorId === usuario.id);
            return (
              <div key={c.id} style={card}>
                <div onClick={() => setAberta(c)} style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Users size={17} color="var(--role-primary-dark)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.nome}
                      </div>
                      <div style={{ fontSize: 11, color: INK_SOFT }}>
                        {CATEGORIAS_COMUNIDADE[c.categoria] || "Geral"} · {c.bairroReferencia || c.cidade || "Online"}
                      </div>
                    </div>
                    {c.participando && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--role-primary-dark)", background: "var(--role-soft)", borderRadius: 999, padding: "3px 8px" }}>
                        participando
                      </span>
                    )}
                  </div>
                  {c.descricao && (
                    <div style={{ fontSize: 12, color: INK_SOFT, marginTop: 8, lineHeight: 1.4 }}>
                      {c.descricao}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 6 }}>
                    {c.totalMembros} {c.totalMembros === 1 ? "membro" : "membros"} · {c.totalPosts || 0} {c.totalPosts === 1 ? "mensagem" : "mensagens"}
                    {ehCriador && <span style={{ marginLeft: 6, color: "var(--role-primary-dark)", fontWeight: 700 }}>· Criador</span>}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <Button
                    small
                    variant={c.participando ? "ghost" : "primary"}
                    loading={processando === c.id}
                    onClick={() => alternarParticipacao(c)}
                  >
                    {c.participando ? "Sair" : "Participar"}
                  </Button>
                  <Button small variant="soft" onClick={() => setAberta(c)}>
                    Abrir conversa
                  </Button>
                  <Button
                    small
                    variant="ghost"
                    icon={Share2}
                    aria-label="Compartilhar comunidade"
                    onClick={() => compartilhar({ titulo: c.nome, texto: `Participe da comunidade ${c.nome} no Reviva!`, url: window.location.origin }, notify)}
                  >
                    Compartilhar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal para Criar Comunidade */}
      <ModalComunidade
        aberto={modalCriarAberto}
        titulo="Nova comunidade"
        onClose={() => setModalCriarAberto(false)}
        onSalvar={criarNovaComunidade}
      />
    </div>
  );
}

export { Comunidades };
