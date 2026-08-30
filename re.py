import os

def criar_arquivos_java(caminhos_src, quantidade=10):
    for caminho in caminhos_src:
        # Cria a estrutura de pastas caso ela não exista
        os.makedirs(caminho, exist_ok=True)
        
        for i in range(1, quantidade + 1):
            # Formata o número com 3 dígitos (001, 002, ..., 010)
            num_formatado = f"{i:02d}"
            
            # Adiciona o prefixo 'Ex' porque classes Java não podem começar com números
            nome_classe = f"L{num_formatado}"
            nome_arquivo = f"{nome_classe}.java"
            
            caminho_completo = os.path.join(caminho, nome_arquivo)
            
            template_java = f'''/**
 * Autor: Vitor Rios — Ciência & Tecnologia
 */
public class {nome_classe} {{
    public static void main(String[] args) {{
        System.out.println("Executando {nome_classe}...");
        
        //Implementar solução aqui
        
    }}
}}
'''
            # Cria e escreve no arquivo .java
            with open(caminho_completo, 'w', encoding='utf-8') as f:
                f.write(template_java)
                
            print(f"Criado: {caminho_completo}")

# Bloco principal para rodar o script
if __name__ == "__main__":
    # Caminhos base onde os arquivos serão criados
    # O 'r' antes da string evita problemas com as barras invertidas do Windows (\)
    pastas_alvo = [
        r"PM\Prova 1\EX GPT\src"
    ]
    
    print("Iniciando a criação dos arquivos Java...")
    criar_arquivos_java(pastas_alvo, 10)
    print("Concluído!")
