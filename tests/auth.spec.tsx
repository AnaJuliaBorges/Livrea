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
    await page.getByRole("button", { name: "Continuar", exact: true }).click();

    await page.goto("/clubes");
  });

  test("deve mostrar erro quando um usuário tentar fazer login com credenciais inválidas", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await page.getByRole("textbox", { name: "Email" }).click();
    await page
      .getByRole("textbox", { name: "Email" })
      .fill("najuborgess@gmail.com");

    await page.getByRole("textbox", { name: "Senha" }).click();
    await page.getByRole("textbox", { name: "Senha" }).fill("naju123");
    await page.getByRole("button", { name: "Continuar", exact: true }).click();

    await page.getByText("Email ou senha inválidos").isVisible();
  });
});
