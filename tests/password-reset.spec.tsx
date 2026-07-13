import { test, expect, type Page } from "@playwright/test";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
};

async function mockRecoverEndpoint(page: Page, status = 200) {
  await page.route("**/auth/v1/recover*", async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    await route.fulfill({
      status,
      headers: { ...corsHeaders, "content-type": "application/json" },
      body: JSON.stringify(
        status === 200 ? {} : { code: status, msg: "rate limit exceeded" },
      ),
    });
  });
}

test.describe("Recuperação de senha", () => {
  test("esqueci minha senha leva à página de recuperação", async ({
    page,
  }) => {
    await page.goto("/login");
    await page
      .getByRole("button", { name: "Esqueci minha senha" })
      .click();

    await page.waitForURL("**/recuperar-senha");
    await expect(page.getByText("Recuperar senha")).toBeVisible();
  });

  test("envia o link e mostra a confirmação", async ({ page }) => {
    await mockRecoverEndpoint(page);

    await page.goto("/recuperar-senha");
    await page
      .getByRole("textbox", { name: "Email" })
      .fill("ana@example.com");
    await page.getByRole("button", { name: "Enviar link" }).click();

    await expect(
      page.getByText(/você receberá um link para redefinir sua senha/),
    ).toBeVisible();

    await page.getByRole("button", { name: "Voltar para o login" }).click();
    await page.waitForURL("**/login");
  });

  test("mostra erro quando o envio falha", async ({ page }) => {
    await mockRecoverEndpoint(page, 429);

    await page.goto("/recuperar-senha");
    await page
      .getByRole("textbox", { name: "Email" })
      .fill("ana@example.com");
    await page.getByRole("button", { name: "Enviar link" }).click();

    await expect(
      page.getByText("Não foi possível enviar o email. Tente novamente."),
    ).toBeVisible();
  });

  test("mostra link inválido em /redefinir-senha sem sessão de recuperação", async ({
    page,
  }) => {
    await page.goto("/redefinir-senha");

    await expect(page.getByText("Validando o link...")).toBeVisible();
    // o estado "inválido" aparece após o timeout de 5s sem sessão
    await expect(
      page.getByText("Link inválido ou expirado", { exact: false }),
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: "Solicitar novo link" }).click();
    await page.waitForURL("**/recuperar-senha");
  });
});
