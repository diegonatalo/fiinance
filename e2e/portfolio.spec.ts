import { expect, test } from "@playwright/test";
import { addFii, assetRow, mockQuotes } from "./fixtures";

test.beforeEach(async ({ page }) => {
  // por padrão, nenhuma cotação: cada teste diz quais preços a rota devolve
  await mockQuotes(page, {});
});

test("adiciona um FII e mantém depois de recarregar", async ({ page }) => {
  await addFii(page, "HGLG11", "10", "150,50");
  await expect(page.getByText("HGLG11 adicionado à carteira")).toBeVisible();
  await expect(assetRow(page, "HGLG11")).toContainText("R$ 1.505,00");

  await page.reload();
  await expect(assetRow(page, "HGLG11")).toContainText("R$ 150,50");
});

test("segunda compra do mesmo FII soma na posição", async ({ page }) => {
  await addFii(page, "XPML11", "10", "100,00");
  await addFii(page, "XPML11", "10", "120,00");
  await expect(page.getByText("Compra somada à posição de XPML11")).toBeVisible();

  // 20 cotas, preço médio de R$ 110,00
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

test("busca as cotações sozinho e mostra na tabela e no painel", async ({ page }) => {
  await mockQuotes(page, { HGLG11: 160 });
  await addFii(page, "HGLG11", "10", "150,00");

  await expect(assetRow(page, "HGLG11")).toContainText("R$ 160,00");
  await expect(assetRow(page, "HGLG11")).toContainText("+6,67%");
  await expect(page.getByRole("status").filter({ hasText: "Cotações de hoje" }).first()).toBeVisible();

  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Painel" }).click();
  await expect(page.getByRole("main")).toContainText("R$ 1.600,00");
});

test("avisa quando as cotações não chegam", async ({ page }) => {
  await page.route("**/api/quotes?**", (route) => route.fulfill({ status: 500, json: {} }));
  await addFii(page, "HGLG11", "10", "150,00");
  await expect(page.getByText("Cotações indisponíveis").first()).toBeVisible();
  await expect(assetRow(page, "HGLG11")).toContainText("—");
});

test("a meta de alocação diz onde aportar", async ({ page }) => {
  await addFii(page, "HGLG11", "10", "100,00");
  await page.goto("/app");
  await page.getByRole("button", { name: "Aumentar meta" }).click();
  await expect(page.getByLabel("Meta em papel")).toHaveValue("5%");
  await expect(page.getByText("Próximo aporte")).toBeVisible();
  await expect(page.getByText("em papel", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Meta em papel")).toHaveValue("5%");
});
