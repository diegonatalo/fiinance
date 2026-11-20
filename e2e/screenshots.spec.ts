import { test } from "@playwright/test";
import { addFii } from "./fixtures";

// Gera os prints da landing em public/landing/. Fica fora da suíte normal:
// rode com `SCREENSHOTS=1 pnpm test:e2e e2e/screenshots.spec.ts`.
test.skip(!process.env.SCREENSHOTS, "só com SCREENSHOTS=1");

/** Carteira de exemplo (fundos e valores fictícios). */
const SAMPLE: [string, string, string][] = [
  ["KNRI11", "40", "142,30"],
  ["HGLG11", "25", "158,90"],
  ["MXRF11", "300", "10,15"],
  ["XPML11", "30", "108,40"],
  ["CPTS11", "120", "8,70"],
];

for (const scheme of ["light", "dark"] as const) {
  test(`print do painel (${scheme})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.emulateMedia({ colorScheme: scheme });
    for (const [ticker, shares, price] of SAMPLE) await addFii(page, ticker, shares, price);
    await page.goto("/app");
    await page.getByLabel("Meta em papel (%)").fill("40");
    await page.getByLabel("Meta em papel (%)").blur();
    await page.waitForTimeout(2_000);
    const name = scheme === "light" ? "painel-claro" : "painel-escuro";
    await page.screenshot({ path: `public/landing/${name}.png` });
  });
}
