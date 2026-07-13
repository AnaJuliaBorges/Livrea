import { test } from "@playwright/test";

// Aquece o Vite dev server antes dos testes paralelos: o primeiro acesso
// paga a transformação de todo o grafo de módulos e, frio, não aguenta
// vários workers simultâneos no Windows.
test("aquece o dev server", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).waitFor();

  await page.goto("/perfil");
  await page.waitForURL("**/login");
});
