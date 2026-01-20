Automação desenvolvida para realizar buscas no portal The New York Times, carregar os resultados e exportar os dados para uma planilha Excel.

O que está automação irá fazer?
- Abre o navegador de forma automatizada (Puppeteer).
- Lida com banners como cookies.
- Faz o scroll e clica em "Show More" até atingir 50 notícias.
- Extrai: Título, Data de Publicação e Descrição.
- Salva tudo em uma pasta chamada `dados_de_pesquisas`.

Bibliotecas que precisam ser instaladas para rodar o projeto:
- **Node.js** (Ambiente de execução)
- **Puppeteer** (Automação do browser)
- **XLSX** (Geração da planilha)
- **Dotenv** (Configurações de ambiente)

### Configuração de Ambiente
Antes de rodar, crie um arquivo na raiz do projeto chamado `Config.env` e adicione a seguinte variável:

urlBase='https://www.nytimes.com'
urlDirecional='https://www.nytimes.com/search?query='

Como rodar o projeto
1. Clone este repositório.
2. Para rodar Utilize os comandos:
   ```bash
   npm install
   node index.js
