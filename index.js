require("dotenv").config({ path: "./Config.env" });
const XLSX = require("xlsx");
const readline = require("readline");
const path = require("path");
const fs = require("fs");

const {
  abrirNavegador,
  buscarTema,
  lerCinquentaNoticias,
  extrairDados,
} = require("./Pesquisa");
//Interface de leitura e escrita no terminal
const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//Função para importar para o Excel
async function exportarParaExcel(noticias, termoBusca) {
  const pastaDestino = path.join(__dirname, "dados_de_pesquisas");
  if (!fs.existsSync(pastaDestino)) {
    fs.mkdirSync(pastaDestino);
  }
//Garante que não terá espaço em branco
  const nomeArquivo = `noticias-${termoBusca.replace(/\s+/g, "_")}.xlsx`;
  const caminhoCompleto = path.join(pastaDestino, nomeArquivo);

//Criar planilha e arquivo Excel e salvar
  const planilha = XLSX.utils.json_to_sheet(noticias);
  const pastaTrabalho = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(pastaTrabalho, planilha, "Notícias");

  XLSX.writeFile(pastaTrabalho, caminhoCompleto);

  console.log(`\nExcel gerado com sucesso em: ${caminhoCompleto}`);
}

// Fluxo principal da aplicação
async function executarScript() {
  terminal.question("Digite o tema que deseja buscar: ", async (tema) => {
    if (!tema.trim()) {
      console.log("Nenhum termo informado. Encerrando...");
      terminal.close();
      return;
    }

    const navegador = await abrirNavegador();

    try {
      const urlBase =
        process.env.urlDirecional || "https://www.nytimes.com/search?query=";
      const urlBusca = urlBase + encodeURIComponent(tema);

      const pagina = await buscarTema(navegador, urlBusca);

      await lerCinquentaNoticias(pagina);

      const resultados = await extrairDados(pagina);

      console.log(
        `\nConcluido! total de notícias extrídas foi: ${resultados.length}`,
      );

      if (resultados.length > 0) {
        await exportarParaExcel(resultados, tema);
      } else {
        console.log(
          `Nenhuma notícia sobre o tema ${tema} foi encontrada para extração.`,
        );
      }
    } catch (erro) {
      console.error("\nOcorreu uma falha durante a execução:");
      console.error(erro.message);
    } finally {
      await navegador.close();
      terminal.close();
    }
  });
}

executarScript();
