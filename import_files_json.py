import json
import os

def criar_projeto_de_json(caminho_json):
    """
    Lê um arquivo JSON e cria a estrutura de arquivos e pastas descrita nele.

    :param caminho_json: O caminho para o arquivo JSON de entrada.
    """
    try:
        # 1. Abrir e carregar o arquivo JSON
        with open(caminho_json, 'r', encoding='utf-8') as f:
            estrutura_arquivos = json.load(f)
        
        print(f"Lendo a estrutura de '{caminho_json}'...")

        # 2. Iterar sobre cada arquivo descrito no JSON
        for arquivo_info in estrutura_arquivos:
            filename = arquivo_info.get('filename')
            content = arquivo_info.get('content')

            if not filename or content is None:
                print(f"⚠️  Item inválido no JSON, pulando: {arquivo_info}")
                continue

            try:
                # 3. Garantir que a estrutura de diretórios exista
                # os.path.dirname() extrai o caminho do diretório do nome do arquivo
                # Ex: 'zevatron_bio/css/style.css' -> 'zevatron_bio/css'
                diretorio = os.path.dirname(filename)
                
                # Se o caminho do diretório não for vazio, crie-o
                if diretorio:
                    # exist_ok=True impede erros se a pasta já existir
                    os.makedirs(diretorio, exist_ok=True)

                # 4. Escrever o conteúdo no arquivo
                with open(filename, 'w', encoding='utf-8') as f_out:
                    f_out.write(content)
                
                print(f"✅ Arquivo criado: {filename}")

            except OSError as e:
                print(f"❌ Erro ao criar o arquivo ou pasta '{filename}': {e}")
        
        print("\nEstrutura de projeto criada com sucesso!")

    except FileNotFoundError:
        print(f"❌ Erro: O arquivo '{caminho_json}' não foi encontrado.")
    except json.JSONDecodeError:
        print(f"❌ Erro: O arquivo '{caminho_json}' não é um JSON válido.")
    except Exception as e:
        print(f"❌ Ocorreu um erro inesperado: {e}")

# --- Execução do Script ---
if __name__ == "__main__":
    # Nome do arquivo JSON que contém a estrutura
    arquivo_de_entrada = "files.json"
    criar_projeto_de_json(arquivo_de_entrada)
