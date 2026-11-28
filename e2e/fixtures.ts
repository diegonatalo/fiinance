import { expect, test as base, type APIRequestContext, type Page } from "@playwright/test";

export const PASSWORD = "senha-de-teste-123";

/** E-mail único por teste: cada um começa com uma conta nova e vazia. */
export const uniqueEmail = () =>
  `e2e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}@exemplo.test`;

/**
 * Cria uma conta pela API do Better Auth. A resposta já traz o cookie de
 * sessão, que fica no contexto do navegador do teste.
 */
export const signUpByApi = async (request: APIRequestContext, baseURL: string, email = uniqueEmail()) => {
  const response = await request.post("/api/auth/sign-up/email", {
    data: { name: "Pessoa de Teste", email, password: PASSWORD },
    headers: { origin: baseURL },
  });
  expect(response.ok(), await response.text()).toBe(true);
  return email;
};

/**
 * Testes do app: cada um roda com uma conta nova, já logada. Para testar sem
 * login, use o `test` do próprio Playwright.
 */
export const test = base.extend({
  page: async ({ page, baseURL }, provide) => {
    await signUpByApi(page.request, baseURL!);
    await provide(page);
  },
});

export { expect };

/** Espera as mudanças chegarem ao banco (o app marca com `data-saving` o que ainda está salvando). */
export const saved = (page: Page) => expect(page.locator("[data-saving]")).toHaveCount(0);

export type FiiFields = {
  type?: "tijolo" | "papel";
  /** segmento (tijolo) ou perfil de risco (papel), como aparece na lista */
  kind?: string;
  dividend?: string;
  rating?: string;
};

/** Cadastra um FII pelo "Novo fundo" da carteira. Valores no formato brasileiro (ex.: "150,50"). */
export const addFii = async (page: Page, ticker: string, shares: string, price: string, fields: FiiFields = {}) => {
  if (!page.url().endsWith("/app/carteira")) await page.goto("/app/carteira");
  const dialog = page.getByRole("dialog", { name: "Novo fundo" });
  // repete o clique se a janela anterior ainda estava fechando
  await expect(async () => {
    await page.getByRole("main").getByRole("button", { name: "Novo fundo" }).first().click({ timeout: 2_000 });
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass();
  await dialog.getByLabel(/^Ticker/).fill(ticker);
  if (fields.type) await dialog.getByRole("button", { name: fields.type, exact: true }).click();
  if (fields.kind) await dialog.getByLabel(fields.type === "papel" ? "Perfil de risco" : "Segmento").selectOption({ label: fields.kind });
  if (fields.rating) await dialog.getByLabel(/^Nota/).selectOption(fields.rating);
  await dialog.getByLabel(/^Cotas/).fill(shares);
  await dialog.getByLabel(/^Preço médio/).fill(price);
  if (fields.dividend) await dialog.getByLabel(/^Último rendimento/).fill(fields.dividend);
  await dialog.getByRole("button", { name: "Adicionar fundo" }).click();
  await expect(dialog).toHaveCount(0);
};

/** Linha do fundo na tabela da carteira. */
export const assetRow = (page: Page, ticker: string) => page.getByRole("row").filter({ hasText: ticker });
