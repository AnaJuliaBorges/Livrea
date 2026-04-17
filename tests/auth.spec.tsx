import { test } from "@playwright/test";

test.describe("Autenticação no Livrea", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("deve permitir que um usuário faça login com sucesso", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await page.getByRole("textbox", { name: "Email" }).click();
    await page
      .getByRole("textbox", { name: "Email" })
      .fill("najuborgess@gmail.com");

    await page.getByRole("textbox", { name: "Senha" }).click();
    await page.getByRole("textbox", { name: "Senha" }).fill("naju123");
    await page.getByRole("button", { name: "Login", exact: true }).click();

    await page.goto("/clubes");
  });
});
