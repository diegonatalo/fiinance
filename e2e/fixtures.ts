import { expect, type Page } from "@playwright/test";

/** Compra um FII pela tela da carteira. Preço no formato brasileiro (ex.: "150,50"). */
export const addFii = async (page: Page, ticker: string, shares: string, price: string) => {
  await page.goto("/carteira");
  await page.getByLabel(/^Ticker/).fill(ticker);
  await page.getByLabel(/^Qtd\. de cotas/).fill(shares);
  await page.getByLabel(/^Preço pago/).fill(price);
  await page.getByRole("button", { name: "Adicionar FII" }).click();
  await expect(page.getByText(`${ticker} adicionado à carteira`)).toBeVisible();
};

/** Linha do ativo na tabela de "Meus ativos". */
export const assetRow = (page: Page, ticker: string) =>
  page.getByRole("row").filter({ hasText: ticker });

/** A cotação vem da brapi: nos testes ela nunca é chamada de verdade. */
export const mockBrapi = async (page: Page, prices: Record<string, number>) => {
  await page.route("https://brapi.dev/**", async (route) => {
    const ticker = decodeURIComponent(new URL(route.request().url()).pathname.split("/").pop() ?? "");
    const price = prices[ticker];
    if (price === undefined) return route.fulfill({ status: 404, json: {} });
    return route.fulfill({ json: { results: [{ regularMarketPrice: price }] } });
  });
};
