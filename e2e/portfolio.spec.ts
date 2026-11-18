import { expect, test } from "@playwright/test";
import { addFii, assetRow, mockBrapi } from "./fixtures";

test("adiciona um FII e mantém depois de recarregar", async ({ page }) => {
  await addFii(page, "HGLG11", "10", "150,50");

  const row = assetRow(page, "HGLG11");
  await expect(row).toContainText("R$ 1.505,00");

  await page.reload();
  await expect(assetRow(page, "HGLG11")).toContainText("R$ 150,50");
});

test("segunda compra do mesmo FII soma na posição", async ({ page }) => {
  await addFii(page, "XPML11", "10", "100,00");
  await page.getByLabel(/^Ticker/).fill("XPML11");
  await page.getByLabel(/^Qtd\. de cotas/).fill("10");
  await page.getByLabel(/^Preço pago/).fill("120,00");
  await page.getByRole("button", { name: "Adicionar FII" }).click();
  await expect(page.getByText("Compra somada à posição de XPML11")).toBeVisible();

  // 20 cotas, preço médio de R$ 110,00
  const row = assetRow(page, "XPML11");
  await expect(row).toContainText("R$ 110,00");
  await expect(row).toContainText("R$ 2.200,00");
});

test("não adiciona com o formulário vazio", async ({ page }) => {
  await page.goto("/carteira");
  await page.getByRole("button", { name: "Adicionar FII" }).click();
  await expect(page.getByText("Informe o ticker")).toBeVisible();
  await expect(page.getByText("Adicione ativos para acompanhar as cotações.")).toBeVisible();
});

test("busca as cotações na brapi e mostra na tabela", async ({ page }) => {
  await mockBrapi(page, { HGLG11: 160 });
  await addFii(page, "HGLG11", "10", "150,00");

  await page.getByRole("button", { name: "Atualizar cotações" }).click();
  await expect(page.getByText("Cotações atualizadas")).toBeVisible();
  await expect(assetRow(page, "HGLG11")).toContainText("R$ 160,00");
});

test("avisa quando a brapi recusa o token", async ({ page }) => {
  await page.route("https://brapi.dev/**", (route) => route.fulfill({ status: 401, json: {} }));
  await addFii(page, "HGLG11", "10", "150,00");

  await page.getByRole("button", { name: "Atualizar cotações" }).click();
  await expect(page.getByText(/Token da brapi ausente ou inválido/)).toBeVisible();
});
