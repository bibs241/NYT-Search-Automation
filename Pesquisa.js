import puppeteer from "puppeteer";

export const espera = (ms) => new Promise((res) => setTimeout(res, ms));

export async function abrirNavegador() {
  return await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      "--start-maximized",
      "--disable-blink-features=AutomationControlled",
    ],
  });
}

export async function limpaAbasInuteis(browser) {
  const paginas = await browser.pages();
  for (const p of paginas) {
    if (p.url() === "about:blank") await p.close();
  }
}

async function bannerCookies(page) {
  await espera(2500);

  const btnClicado = await page.evaluate(() => {
    const botoes = Array.from(document.querySelectorAll("button"));
    const alvo = botoes.find(
      (b) => /aceitar tudo|accept all/i.test(b.innerText) && b.offsetHeight > 0,
    );

    if (alvo) {
      const box = alvo.getBoundingClientRect();
      return {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
        texto: alvo.innerText,
      };
    }
    return null;
  });

  if (btnClicado) {
    await page.mouse.click(btnClicado.x, btnClicado.y);
    console.log(`Botão "${btnClicado.texto}" dos cookies foi clicado.`);
    return true;
  }
  return false;
}

export async function buscarTema(browser, urlBusca) {
  const page = await browser.newPage();
  await page.goto(urlBusca, { waitUntil: "networkidle2" });

  await limpaAbasInuteis(browser);

  // Caso o clique automatico não funcione, aciona o clique manual
  const sucessoAuto = await bannerCookies(page);
  if (!sucessoAuto) {
    console.log("Aguardando interação com banner de cookies...");
    try {
      await page.waitForSelector("#fides-accept-all-button", {
        timeout: 10000,
      });
      await page.click("#fides-accept-all-button");
    } catch (e) {
      console.log("Banner não apareceu ou já foi fechado.");
    }
  }

  await page.waitForSelector("ol > li", { timeout: 30000 });
  return page;
}

export async function lerCinquentaNoticias(page) {
  let carregados = 0;
  let checksSemNovidade = 0;

  while (carregados < 50 && checksSemNovidade < 8) {
    carregados = await page.evaluate(
      () => document.querySelectorAll("ol > li").length,
    );
    console.log(`Status: ${carregados}/50 notícias...`);

    if (carregados >= 50) break;

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await espera(1500);

    const btnShowMore = await page.$(
      'button[data-testid="search-show-more-button"]',
    );

    if (btnShowMore) {
      await btnShowMore.scrollIntoView({ behavior: "smooth", block: "center" });
      await espera(500);
      await btnShowMore.click();
      checksSemNovidade = 0;
    } else {
      checksSemNovidade++;
    }
    await espera(2000);
  }
}

export async function extrairDados(page) {
  return await page.evaluate(() => {
    const itens = Array.from(document.querySelectorAll("ol > li")).slice(0, 50);
    return itens.map((li) => ({
      titulo: li.querySelector("h4")?.innerText.trim() || "N/A",
      data_publicacao:
        li.querySelector("span, time")?.innerText.trim() || "N/A",
      descricao:
        li.querySelector("p")?.innerText.trim() || "Sem resumo disponível",
    }));
  });
}
