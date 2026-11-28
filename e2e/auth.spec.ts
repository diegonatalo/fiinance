import { expect, test } from "@playwright/test";
import { PASSWORD, addFii, assetRow, saved, signUpByApi, uniqueEmail } from "./fixtures";

const signIn = async (page: import("@playwright/test").Page, email: string, password = PASSWORD) => {
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
};

test("sem login, o app manda para entrar e volta para a página pedida depois", async ({ page, baseURL }) => {
  const email = await signUpByApi(page.request, baseURL!);
  await page.context().clearCookies();

  await page.goto("/app/calculadoras");
  await expect(page).toHaveURL("/entrar?de=%2Fapp%2Fcalculadoras");

  await signIn(page, email);
  await expect(page).toHaveURL("/app/calculadoras");
  await expect(page.getByRole("heading", { level: 1, name: "Calculadoras" })).toBeVisible();
});

test("cria a conta pela tela, a carteira fica na conta e volta ao entrar de novo", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/cadastro");
  await page.getByLabel("Nome").fill("Ana");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL("/app");

  await addFii(page, "HGLG11", "10", "150,00");
  await saved(page);

  await page.goto("/app/conta");
  await expect(page.getByRole("main").getByText(email)).toBeVisible();
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/app");
  await expect(page).toHaveURL("/entrar");

  await signIn(page, email);
  await expect(page).toHaveURL("/app");
  await page.goto("/app/carteira");
  await expect(assetRow(page, "HGLG11")).toContainText("R$ 1.500,00");
});

test("senha errada mostra o erro e não entra", async ({ page, baseURL }) => {
  const email = await signUpByApi(page.request, baseURL!);
  await page.context().clearCookies();
  await page.goto("/entrar");
  await signIn(page, email, "senha-errada-000");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("E-mail ou senha incorretos.");
  await expect(page).toHaveURL("/entrar");
});

test("não cria duas contas com o mesmo e-mail", async ({ page, baseURL }) => {
  const email = await signUpByApi(page.request, baseURL!);
  await page.context().clearCookies();
  await page.goto("/cadastro");
  await page.getByLabel("Nome").fill("Outra pessoa");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Já existe uma conta com esse e-mail");
});

test("uma conta não vê a carteira de outra", async ({ browser, baseURL }) => {
  const ana = await browser.newContext({ baseURL });
  const anaPage = await ana.newPage();
  await signUpByApi(anaPage.request, baseURL!);
  await addFii(anaPage, "KNRI11", "5", "140,00");
  await saved(anaPage);

  const bia = await browser.newContext({ baseURL });
  const biaPage = await bia.newPage();
  await signUpByApi(biaPage.request, baseURL!);
  await biaPage.goto("/app/carteira");
  await expect(biaPage.getByText("Carteira vazia")).toBeVisible();
  await expect(biaPage.getByText("KNRI11")).toHaveCount(0);

  await ana.close();
  await bia.close();
});

test("excluir a conta apaga tudo e não deixa entrar de novo", async ({ page, baseURL }) => {
  const email = await signUpByApi(page.request, baseURL!);
  await page.goto("/app/conta");
  await page.getByRole("main").getByRole("button", { name: "Excluir conta" }).click();
  const dialog = page.getByRole("dialog", { name: "Excluir sua conta?" });
  await dialog.getByLabel("Sua senha").fill(PASSWORD);
  await dialog.getByRole("button", { name: "Excluir conta" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/entrar");
  await signIn(page, email);
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("E-mail ou senha incorretos.");
});

test("excluir a conta com a senha errada não apaga nada", async ({ page, baseURL }) => {
  await signUpByApi(page.request, baseURL!);
  await page.goto("/app/conta");
  await page.getByRole("main").getByRole("button", { name: "Excluir conta" }).click();
  const dialog = page.getByRole("dialog", { name: "Excluir sua conta?" });
  await dialog.getByLabel("Sua senha").fill("senha-errada-123");
  await dialog.getByRole("button", { name: "Excluir conta" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Senha incorreta. A conta não foi excluída.");

  await page.reload();
  await expect(page.getByRole("main").getByRole("button", { name: "Excluir conta" })).toBeVisible();
});
