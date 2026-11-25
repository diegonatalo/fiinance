import { expect, type Page } from "@playwright/test";

/** Compra um FII pela "Nova operação" da carteira. Preço no formato brasileiro (ex.: "150,50"). */
export const addFii = async (page: Page, ticker: string, shares: string, price: string) => {
  if (!page.url().endsWith("/app/carteira")) await page.goto("/app/carteira");
  await page.getByRole("main").getByRole("button", { name: "Nova operação" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Nova operação" });
  await dialog.getByLabel(/^Ticker/).fill(ticker);
  await dialog.getByLabel(/^Qtd\. de cotas/).fill(shares);
  await dialog.getByLabel(/^Preço pago/).fill(price);
  await dialog.getByRole("button", { name: "Adicionar FII" }).click();
  await expect(dialog).toHaveCount(0);
};

/** Linha do fundo na tabela da carteira. */
export const assetRow = (page: Page, ticker: string) => page.getByRole("row").filter({ hasText: ticker });
