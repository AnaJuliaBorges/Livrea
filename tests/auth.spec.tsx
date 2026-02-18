import { test } from "@playwright/test";

test.describe("Autenticação no Livrea", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("deve permitir que um usuário faça login com sucesso", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Email" }).click();
    await page.getByRole("textbox", { name: "Email" }).fill("ana@gmail.com");

    await page.getByRole("link", { name: "Esqueceu sua senha?" }).click();
    await page.getByRole("textbox", { name: "Senha" }).fill("123");
    await page.getByRole("button", { name: "Login", exact: true }).click();

    await page.goto("/clubes");
  });
});
