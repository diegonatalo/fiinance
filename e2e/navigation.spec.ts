import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/app", link: "Painel" },
  { path: "/app/carteira", link: "Carteira" },
  { path: "/app/proventos", link: "Proventos" },
  { path: "/app/calculadoras", link: "Calculadoras" },
];

const collectErrors = (page: import("@playwright/test").Page) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
};

for (const { path, link } of PAGES) {
  test(`abre ${path} sem erros no console`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(path);
    await expect(
      page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: link }),
    ).toHaveAttribute("aria-current", "page");
    expect(errors).toEqual([]);
  });
}

test("a página inicial apresenta o FIInance e leva ao painel", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/carteira de FIIs/);
  await page.getByRole("main").getByRole("link", { name: "Abrir o painel" }).click();
  await expect(page).toHaveURL("/app");
  // A marca no app volta para a página inicial.
  await page.getByRole("link", { name: "FIInance, página inicial" }).click();
  await expect(page).toHaveURL("/");
  expect(errors).toEqual([]);
});

test("os endereços antigos redirecionam para /app", async ({ request }) => {
  for (const path of ["/carteira", "/proventos", "/calculadoras"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(308);
    expect(response.headers().location, path).toBe(`/app${path}`);
  }
});

for (const { path, heading } of [
  { path: "/privacidade", heading: "Privacidade" },
  { path: "/termos", heading: "Termos de uso" },
]) {
  test(`abre ${path} pelo rodapé sem erros no console`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: heading }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("endereço desconhecido mostra a página 404", async ({ page }) => {
  const response = await page.goto("/nao-existe");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Página não encontrada")).toBeVisible();
  await page.getByRole("link", { name: "Voltar ao início" }).click();
  await expect(page).toHaveURL("/");
});
