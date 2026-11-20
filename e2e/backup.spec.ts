import { expect, test } from "@playwright/test";
import { addFii, assetRow } from "./fixtures";

test("exporta o backup, apaga tudo e importa de volta", async ({ page }, testInfo) => {
  await addFii(page, "KNRI11", "5", "140,00");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Exportar backup (JSON)" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^fiinance-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const file = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(file);

  // Simula trocar de computador: o navegador fica sem nenhum dado.
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(assetRow(page, "KNRI11")).toHaveCount(0);

  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByText("Backup importado")).toBeVisible();
  await expect(assetRow(page, "KNRI11")).toContainText("R$ 700,00");
});

test("pede confirmação antes de substituir dados existentes", async ({ page }, testInfo) => {
  await addFii(page, "KNRI11", "5", "140,00");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Exportar backup (JSON)" }).click(),
  ]);
  const file = testInfo.outputPath("backup.json");
  await download.saveAs(file);

  // Recusar a confirmação não muda nada.
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByText("Backup importado")).toHaveCount(0);
  await expect(assetRow(page, "KNRI11")).toBeVisible();
});

test("recusa um arquivo que não é backup", async ({ page }) => {
  await page.goto("/app/carteira");
  await page.locator('input[type="file"]').setInputFiles({
    name: "qualquer.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"nada": true}'),
  });
  await expect(page.getByText("Arquivo inválido: nada foi alterado")).toBeVisible();
});
