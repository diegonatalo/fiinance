import { addFii, assetRow, expect, saved, test } from "./fixtures";

test("cadastra fundos de tijolo e de papel e eles continuam lá depois de recarregar", async ({ page }) => {
  await addFii(page, "HGLG11", "10", "150,50", { kind: "Logístico", dividend: "1,10", rating: "8" });
  await expect(page.getByText("HGLG11 adicionado à carteira")).toBeVisible();
  await addFii(page, "MXRF11", "100", "9,87", { type: "papel", kind: "High Yield", dividend: "0,0825" });
  await expect(assetRow(page, "HGLG11")).toContainText("R$ 1.505,00");

  await saved(page);
  await page.reload();
  const hglg = assetRow(page, "HGLG11");
  await expect(hglg).toContainText("Tijolo · Logístico · nota 8");
  await expect(hglg).toContainText("R$ 150,50");
  // 10 × R$ 1,10
  await expect(hglg).toContainText("R$ 11,00");
  const mxrf = assetRow(page, "MXRF11");
  await expect(mxrf).toContainText("Papel · High Yield · nota 5");
  await expect(mxrf).toContainText("R$ 0,0825 por cota");
});

test("não adiciona com o formulário vazio nem com ticker repetido", async ({ page }) => {
  await page.goto("/app/carteira");
  await expect(page.getByText("Carteira vazia")).toBeVisible();
  await page.getByRole("main").getByRole("button", { name: "Novo fundo" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Novo fundo" });
  await dialog.getByRole("button", { name: "Adicionar fundo" }).click();
  await expect(dialog.getByText("Informe o ticker")).toBeVisible();
  await dialog.getByRole("button", { name: "Cancelar" }).click();

  await addFii(page, "KNRI11", "5", "150,00");
  await page.getByRole("main").getByRole("button", { name: "Novo fundo" }).first().click();
  await dialog.getByLabel(/^Ticker/).fill("knri11");
  await dialog.getByLabel(/^Cotas/).fill("1");
  await dialog.getByLabel(/^Preço médio/).fill("10");
  await dialog.getByRole("button", { name: "Adicionar fundo" }).click();
  await expect(dialog.getByText("Ticker já cadastrado")).toBeVisible();
});

test("editar muda a posição e excluir pode ser desfeito", async ({ page }) => {
  await addFii(page, "XPML11", "10", "100,00");
  await page.getByRole("table").getByRole("button", { name: "Editar XPML11" }).click();
  const dialog = page.getByRole("dialog", { name: "Editar fundo" });
  await dialog.getByLabel(/^Cotas/).fill("20");
  await dialog.getByLabel(/^Preço médio/).fill("110,00");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();
  await saved(page);
  await page.reload();
  await expect(assetRow(page, "XPML11")).toContainText("R$ 2.200,00");

  await page.getByRole("table").getByRole("button", { name: "Excluir XPML11" }).click();
  await page.getByRole("button", { name: "Desfazer" }).click();
  await saved(page);
  await page.reload();
  await expect(assetRow(page, "XPML11")).toContainText("R$ 2.200,00");

  await page.getByRole("table").getByRole("button", { name: "Excluir XPML11" }).click();
  await saved(page);
  await page.reload();
  await expect(page.getByText("Carteira vazia")).toBeVisible();
});

test("o painel mostra o total, os proventos esperados, a diversificação e onde aportar", async ({ page }) => {
  await addFii(page, "HGLG11", "10", "100,00", { kind: "Logístico", dividend: "1,00", rating: "8" });
  await addFii(page, "KNRI11", "5", "100,00", { kind: "Híbrido", dividend: "0,80", rating: "6" });
  await addFii(page, "MXRF11", "50", "10,00", { type: "papel", kind: "High Grade", dividend: "0,10", rating: "6" });
  await saved(page);
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Painel" }).click();

  const main = page.getByRole("main");
  await expect(main).toContainText("R$ 2.000,00");
  // 10 + 4 + 5
  await expect(main).toContainText("R$ 19,00");

  const byType = main.getByRole("figure", { name: "Por tipo" });
  await expect(byType).toContainText("Tijolo75,0%");
  await expect(main.getByRole("figure", { name: "Tijolo por segmento" })).toContainText("Híbrido33,3%");
  await expect(main.getByRole("figure", { name: "Papel por risco" })).toContainText("High Grade100,0%");

  // metas 40/30/30: HGLG (50%) define o aporte mínimo de R$ 500, dividido entre KNRI e MXRF
  await expect(main.getByText("R$ 500,00 levam todos os fundos à meta só com compras.")).toBeVisible();
  // com R$ 1.000 a carteira vai a R$ 3.000: faltam R$ 200 em HGLG e R$ 400 em KNRI e em MXRF
  await main.getByLabel("Valor do aporte (R$)").fill("1000");
  const card = main.locator("section").filter({ has: page.getByRole("heading", { name: "Próximo aporte" }) });
  const share = (ticker: string) => card.getByRole("listitem").filter({ hasText: ticker });
  await expect(share("MXRF11")).toContainText("R$ 400,00");
  await expect(share("HGLG11")).toContainText("R$ 200,00");
});

test("aplicar a compra simulada atualiza a posição do fundo", async ({ page }) => {
  await addFii(page, "HGLG11", "10", "10,00");
  await saved(page);
  await page.goto("/app/calculadoras");
  const main = page.getByRole("main");
  await main.getByLabel(/^Cotas compradas/).first().fill("10");
  await main.getByLabel(/^Preço por cota/).first().fill("12");
  await main.getByRole("button", { name: "Aplicar esta compra ao fundo" }).click();
  await expect(page.getByText("HGLG11: 20 cotas a R$ 11,00")).toBeVisible();
  await saved(page);
  await page.goto("/app/carteira");
  await expect(assetRow(page, "HGLG11")).toContainText("R$ 220,00");
});
