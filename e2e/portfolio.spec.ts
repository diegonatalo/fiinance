import { addFii, assetRow, expect, saved, test } from "./fixtures";

test("adiciona um FII e ele continua lá depois de recarregar", async ({ page }) => {
  await addFii(page, "HGLG11", "10", "150,50");
  await expect(page.getByText("HGLG11 adicionado à carteira")).toBeVisible();
  await expect(assetRow(page, "HGLG11")).toContainText("R$ 1.505,00");

  await saved(page);
  await page.reload();
  await expect(assetRow(page, "HGLG11")).toContainText("R$ 150,50");
});

test("segunda compra do mesmo FII soma na posição", async ({ page }) => {
  await addFii(page, "XPML11", "10", "100,00");
  await addFii(page, "XPML11", "10", "120,00");
  await expect(page.getByText("Compra somada à posição de XPML11")).toBeVisible();

  // 20 cotas, preço médio de R$ 110,00
  await saved(page);
  await page.reload();
  const row = assetRow(page, "XPML11");
  await expect(row).toContainText("R$ 110,00");
  await expect(row).toContainText("R$ 2.200,00");
});

test("não adiciona com o formulário vazio", async ({ page }) => {
  await page.goto("/app/carteira");
  await expect(page.getByText("Carteira vazia")).toBeVisible();
  await page.getByRole("main").getByRole("button", { name: "Nova operação" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Adicionar FII" }).click();
  await expect(page.getByText("Informe o ticker")).toBeVisible();
});

test("o painel mostra o total investido e o peso de cada fundo", async ({ page }) => {
  await addFii(page, "HGLG11", "10", "150,00");
  await addFii(page, "MXRF11", "50", "10,00");
  await saved(page);
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Painel" }).click();
  await expect(page.getByRole("main")).toContainText("R$ 2.000,00");
  await expect(page.getByRole("main")).toContainText("75,0%");
});

test("a meta de alocação diz onde aportar e fica salva", async ({ page }) => {
  await addFii(page, "HGLG11", "10", "100,00");
  await saved(page);
  await page.goto("/app");
  await page.getByRole("button", { name: "Aumentar meta" }).click();
  await expect(page.getByLabel("Meta em papel")).toHaveValue("5%");
  await expect(page.getByText("Próximo aporte")).toBeVisible();
  await expect(page.getByText("em papel", { exact: true })).toBeVisible();
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Meta em papel")).toHaveValue("5%");
});

test("provento lançado e fundo excluído ficam salvos", async ({ page }) => {
  await addFii(page, "KNRI11", "20", "150,00");
  await saved(page);
  await page.goto("/app/proventos");
  await page.getByRole("main").getByRole("button", { name: "Lançar provento" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Lançar provento" });
  await dialog.getByLabel("Ativo").selectOption({ label: "KNRI11" });
  await dialog.getByLabel(/^Valor por cota/).fill("1,10");
  await dialog.getByRole("button", { name: "Registrar provento" }).click();
  await saved(page);
  await page.reload();
  await expect(page.getByRole("main")).toContainText("R$ 22,00");

  await page.goto("/app/carteira");
  await page.getByRole("table").getByRole("button", { name: "Excluir KNRI11" }).click();
  await saved(page);
  await page.reload();
  await expect(page.getByText("Carteira vazia")).toBeVisible();
});
