import { test, type Page } from "@playwright/test";

// Gera os prints da landing em public/landing/ e os do README em docs/screenshots/. Fica fora da suíte normal:
// rode com `SCREENSHOTS=1 pnpm test:e2e e2e/screenshots.spec.ts`.
test.skip(!process.env.SCREENSHOTS, "só com SCREENSHOTS=1");

/** Carteira de exemplo (fundos e valores fictícios): ticker, tipo, segmento, cotas, preço pago, provento. */
const SAMPLE: [string, "papel" | "tijolo", string, number, number, number][] = [
  ["MXRF11", "papel", "IPCA", 750, 9.82, 0.07],
  ["KNCR11", "papel", "CDI", 50, 102.54, 0.38],
  ["HGLG11", "tijolo", "logística", 30, 153.83, 0.4],
  ["XPML11", "tijolo", "shoppings", 35, 109.34, 0.92],
  ["KNRI11", "tijolo", "híbrido", 20, 159, 0.41],
  ["KNIP11", "papel", "IPCA", 25, 92.4, 0.36],
  ["BTLG11", "tijolo", "logística", 22, 99.8, 0.32],
];

/** Mês `back` meses antes de hoje, no formato aaaa-mm. */
const monthAgo = (back: number) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - back);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/** Os dados no formato do app: duas compras por fundo ao longo dos meses e um provento por mês. */
const sampleData = () => {
  const data = {
    version: 2,
    assets: [] as object[],
    transactions: [] as object[],
    payouts: [] as object[],
    paperTarget: 40,
  };
  SAMPLE.forEach(([ticker, type, segment, shares, price, dividend], i) => {
    const id = `exemplo-${i}`;
    const first = Math.floor(shares / 2);
    data.assets.push({ id, ticker, type, segment });
    data.transactions.push(
      { id: `${id}-c1`, assetId: id, type: "compra", date: `${monthAgo(10 - i)}-10`, shares: first, price },
      { id: `${id}-c2`, assetId: id, type: "compra", date: `${monthAgo(8 - i)}-10`, shares: shares - first, price },
    );
    for (let back = 7 - i; back >= 1; back--) {
      data.payouts.push({ id: `${id}-p${back}`, assetId: id, date: `${monthAgo(back)}-15`, valuePerShare: dividend, shares });
    }
  });
  return data;
};

/** Abre `path` com a carteira de exemplo, pronto para o print. */
const openWithSample = async (page: Page, path: string, scheme: "light" | "dark") => {
  await page.emulateMedia({ colorScheme: scheme });
  await page.goto(path);
  await page.evaluate((data) => localStorage.setItem("fiinance:data:v1", JSON.stringify(data)), sampleData());
  await page.reload();
  await page.getByRole("main").waitFor();
  await page.waitForTimeout(1_500);
};

for (const scheme of ["light", "dark"] as const) {
  test(`print do painel (${scheme})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openWithSample(page, "/app", scheme);
    const name = scheme === "light" ? "painel-claro" : "painel-escuro";
    await page.screenshot({ path: `public/landing/${name}.png` });
  });
}

/** Prints do README (docs/screenshots/), lidos pelo readme-kit. */
const README_SHOTS: { path: string; file: string; scheme: "light" | "dark" }[] = [
  { path: "/app", file: "painel-dark", scheme: "dark" },
  { path: "/app", file: "painel-light", scheme: "light" },
  { path: "/app/carteira", file: "carteira", scheme: "dark" },
  { path: "/app/proventos", file: "proventos", scheme: "dark" },
  { path: "/app/calculadoras", file: "calculadoras", scheme: "dark" },
];

for (const shot of README_SHOTS) {
  test(`print do README: ${shot.file}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openWithSample(page, shot.path, shot.scheme);
    await page.screenshot({ path: `docs/screenshots/${shot.file}.png`, fullPage: true });
  });
}

for (const [path, file] of [
  ["/app", "mobile-painel"],
  ["/app/carteira", "mobile-carteira"],
] as const) {
  test(`print do README: ${file}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
    const page = await context.newPage();
    await openWithSample(page, path, "dark");
    await page.screenshot({ path: `docs/screenshots/${file}.png` });
    await context.close();
  });
}
