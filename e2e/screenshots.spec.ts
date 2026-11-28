import { test, type Page } from "@playwright/test";
import { addFii, saved, signUpByApi } from "./fixtures";

// Gera os prints da landing em public/landing/ e os do README em docs/screenshots/. Fica fora da suíte normal:
// rode com `SCREENSHOTS=1 pnpm test:e2e e2e/screenshots.spec.ts`.
test.skip(!process.env.SCREENSHOTS, "só com SCREENSHOTS=1");
// uma conta só, montada pela interface; os prints vêm depois
test.setTimeout(300_000);

/** Carteira de exemplo (fundos e valores fictícios): ticker, tipo, segmento ou risco, cotas, preço médio, rendimento, nota. */
const SAMPLE: [string, "papel" | "tijolo", string, string, string, string, string][] = [
  ["MXRF11", "papel", "High Yield", "750", "9,82", "0,09", "6"],
  ["KNCR11", "papel", "High Grade", "50", "102,54", "1,05", "8"],
  ["HGLG11", "tijolo", "Logístico", "30", "153,83", "1,10", "9"],
  ["XPML11", "tijolo", "Shoppings", "35", "109,34", "0,92", "7"],
  ["KNRI11", "tijolo", "Híbrido", "20", "159,00", "1,00", "7"],
  ["KNIP11", "papel", "Middle Risk", "25", "92,40", "0,85", "5"],
  ["TRBL11", "tijolo", "Renda urbana", "22", "99,80", "0,78", "6"],
];

const fillSample = async (page: Page) => {
  for (const [ticker, type, kind, shares, price, dividend, rating] of SAMPLE) {
    await addFii(page, ticker, shares, price, { type, kind, dividend, rating });
  }
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
