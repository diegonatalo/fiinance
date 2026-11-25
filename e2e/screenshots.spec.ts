import { expect, test, type Locator, type Page } from "@playwright/test";
import { saved, signUpByApi } from "./fixtures";

// Gera os prints da landing em public/landing/ e os do README em docs/screenshots/. Fica fora da suíte normal:
// rode com `SCREENSHOTS=1 pnpm test:e2e e2e/screenshots.spec.ts`.
test.skip(!process.env.SCREENSHOTS, "só com SCREENSHOTS=1");
// uma conta só, montada pela interface; os prints vêm depois
test.setTimeout(300_000);

/** Carteira de exemplo (fundos e valores fictícios): ticker, tipo, segmento, cotas, preço pago, provento. */
const SAMPLE: [string, "papel" | "tijolo", string, number, string, string][] = [
  ["MXRF11", "papel", "IPCA", 750, "9,82", "0,07"],
  ["KNCR11", "papel", "CDI", 50, "102,54", "0,38"],
  ["HGLG11", "tijolo", "logística", 30, "153,83", "0,40"],
  ["XPML11", "tijolo", "shoppings", 35, "109,34", "0,92"],
  ["KNRI11", "tijolo", "híbrido", 20, "159,00", "0,41"],
  ["KNIP11", "papel", "IPCA", 25, "92,40", "0,36"],
  ["BTLG11", "tijolo", "logística", 22, "99,80", "0,32"],
];

/** Dia `day` do mês `back` meses antes de hoje (aaaa-mm-dd). */
const dayMonthsAgo = (back: number, day: number) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - back);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

/** Abre a janela pelo botão; repete o clique se a anterior ainda estava fechando. */
const openDialog = async (page: Page, button: string, dialog: Locator) => {
  await expect(async () => {
    await page.getByRole("main").getByRole("button", { name: button }).first().click({ timeout: 2_000 });
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass();
};

const buy = async (page: Page, [ticker, type, segment]: (typeof SAMPLE)[number], shares: number, price: string, date: string) => {
  const dialog = page.getByRole("dialog", { name: "Nova operação" });
  await openDialog(page, "Nova operação", dialog);
  await dialog.getByLabel(/^Ticker/).fill(ticker);
  await dialog.getByRole("button", { name: type, exact: true }).click();
  await dialog.getByLabel("Segmento").selectOption(segment);
  await dialog.getByLabel("Data da compra").fill(date);
  await dialog.getByLabel(/^Qtd\. de cotas/).fill(String(shares));
  await dialog.getByLabel(/^Preço pago/).fill(price);
  await dialog.getByRole("button", { name: "Adicionar FII" }).click();
  await expect(dialog).toHaveCount(0);
};

const payout = async (page: Page, ticker: string, value: string, date: string) => {
  const dialog = page.getByRole("dialog", { name: "Lançar provento" });
  await openDialog(page, "Lançar provento", dialog);
  await dialog.getByLabel("Ativo").selectOption({ label: ticker });
  await dialog.getByLabel("Data de pagamento").fill(date);
  await dialog.getByLabel(/^Valor por cota/).fill(value);
  await dialog.getByRole("button", { name: "Registrar provento" }).click();
  await expect(dialog).toHaveCount(0);
};

/** Duas compras por fundo ao longo dos meses e um provento por mês, depois a meta de 40% em papel. */
const fillSample = async (page: Page) => {
  await page.goto("/app/carteira");
  for (const [i, fund] of SAMPLE.entries()) {
    const first = Math.floor(fund[3] / 2);
    await buy(page, fund, first, fund[4], dayMonthsAgo(10 - i, 10));
    await buy(page, fund, fund[3] - first, fund[4], dayMonthsAgo(8 - i, 10));
  }
  await saved(page);
  await page.goto("/app/proventos");
  for (const [i, [ticker, , , , , value]] of SAMPLE.entries()) {
    for (let back = 7 - i; back >= 1; back--) await payout(page, ticker, value, dayMonthsAgo(back, 15));
  }
  await saved(page);
  await page.goto("/app");
  await page.getByLabel("Meta em papel").fill("40");
  await page.getByLabel("Meta em papel").blur();
  await saved(page);
};

const shoot = async (page: Page, path: string, scheme: "light" | "dark", file: string, fullPage = false) => {
  await page.emulateMedia({ colorScheme: scheme });
  await page.goto(path);
  await page.getByRole("main").waitFor();
  await page.waitForTimeout(1_000);
  await page.screenshot({ path: file, fullPage });
};

test("prints da landing e do README", async ({ page, browser, baseURL }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await signUpByApi(page.request, baseURL!);
  await fillSample(page);

  await shoot(page, "/app", "light", "public/landing/painel-claro.png");
  await shoot(page, "/app", "dark", "public/landing/painel-escuro.png");

  for (const [path, file, scheme] of [
    ["/app", "painel-dark", "dark"],
    ["/app", "painel-light", "light"],
    ["/app/carteira", "carteira", "dark"],
    ["/app/proventos", "proventos", "dark"],
    ["/app/calculadoras", "calculadoras", "dark"],
  ] as const) {
    await shoot(page, path, scheme, `docs/screenshots/${file}.png`, true);
  }

  // celular: a mesma conta, noutro contexto com o mesmo cookie
  const mobile = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    storageState: await page.context().storageState(),
  });
  const phone = await mobile.newPage();
  await shoot(phone, "/app", "dark", "docs/screenshots/mobile-painel.png");
  await shoot(phone, "/app/carteira", "dark", "docs/screenshots/mobile-carteira.png");
  await mobile.close();
});
