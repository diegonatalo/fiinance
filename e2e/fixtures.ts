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

/** Compra um FII pela "Nova operação" da carteira. Preço no formato brasileiro (ex.: "150,50"). */
export const addFii = async (page: Page, ticker: string, shares: string, price: string) => {
  if (!page.url().endsWith("/app/carteira")) await page.goto("/app/carteira");
  await page.getByRole("main").getByRole("button", { name: "Nova operação" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Nova operação" });
  await dialog.getByLabel(/^Ticker/).fill(ticker);
  await dialog.getByLabel(/^Qtd\. de cotas/).fill(shares);
  await dialog.getByLabel(/^Preço pago/).fill(price);
  await dialog.getByRole("button", { name: "Adicionar FII" }).click();
  await expect(dialog).toHaveCount(0);
};

/** Linha do fundo na tabela da carteira. */
export const assetRow = (page: Page, ticker: string) => page.getByRole("row").filter({ hasText: ticker });
