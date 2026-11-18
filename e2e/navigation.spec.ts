import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/", link: "Painel" },
  { path: "/carteira", link: "Carteira" },
  { path: "/proventos", link: "Proventos" },
  { path: "/calculadoras", link: "Calculadoras" },
];

for (const { path, link } of PAGES) {
  test(`abre ${path} sem erros no console`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(path);
    await expect(
      page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: link }),
    ).toHaveAttribute("aria-current", "page");
    expect(errors).toEqual([]);
  });
}

test("endereço desconhecido mostra a página 404", async ({ page }) => {
  const response = await page.goto("/nao-existe");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Página não encontrada")).toBeVisible();
  await page.getByRole("link", { name: "Voltar ao painel" }).click();
  await expect(page).toHaveURL("/");
});
