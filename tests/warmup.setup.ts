import { test } from "@playwright/test";

test("aquece o dev server", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).waitFor();

  await page.goto("/perfil");
  await page.waitForURL("**/login");
});
