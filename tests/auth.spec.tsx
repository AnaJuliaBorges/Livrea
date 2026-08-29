import { test, expect, type Page } from "@playwright/test";

const EMAIL = "e2e@livrea.test";
const PASSWORD = "senha-e2e";
const USER_ID = "e2e-user";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
};

const nowIso = new Date().toISOString();

const fakeUser = {
  id: USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: EMAIL,
  email_confirmed_at: nowIso,
  phone: "",
  confirmed_at: nowIso,
  last_sign_in_at: nowIso,
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  identities: [],
  created_at: nowIso,
  updated_at: nowIso,
};

function fakeJwt() {
  const encode = (payload: object) =>
    Buffer.from(JSON.stringify(payload)).toString("base64url");
  const header = encode({ alg: "HS256", typ: "JWT" });
  const body = encode({
    sub: USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: EMAIL,
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  return `${header}.${body}.assinatura-fake`;
}

function jsonResponse(body: unknown, status = 200) {
  return {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

async function preflight(route: {
  request: () => { method: () => string };
  fulfill: (r: object) => Promise<void>;
}) {
  await route.fulfill({ status: 204, headers: corsHeaders });
}

async function setupAuthMocks(page: Page, { succeeds = true } = {}) {
  await page.route("**/auth/v1/token*", async (route) => {
    if (route.request().method() === "OPTIONS") return preflight(route);

    if (!succeeds) {
      await route.fulfill(
        jsonResponse(
          {
            code: 400,
            error_code: "invalid_credentials",
            msg: "Invalid login credentials",
          },
          400,
        ),
      );
      return;
    }

    await route.fulfill(
      jsonResponse({
        access_token: fakeJwt(),
        token_type: "bearer",
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: "refresh-fake",
        user: fakeUser,
      }),
    );
  });

  await page.route("**/auth/v1/user*", async (route) => {
    if (route.request().method() === "OPTIONS") return preflight(route);
    await route.fulfill(jsonResponse(fakeUser));
  });

  await page.route("**/rest/v1/profiles*", async (route) => {
    if (route.request().method() === "OPTIONS") return preflight(route);
    await route.fulfill(
      jsonResponse([{ id: USER_ID, name: "Ana E2E Teste", bio: null }]),
    );
  });

  await page.route("**/rest/v1/**", async (route) => {
    if (route.request().method() === "OPTIONS") return preflight(route);
    await route.fulfill(jsonResponse([]));
  });
}

async function fillLoginForm(page: Page) {
  await page.getByRole("textbox", { name: "Email" }).fill(EMAIL);
  await page.getByRole("textbox", { name: "Senha" }).fill(PASSWORD);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
}

test.describe("Autenticação no Livrea", () => {
  test("faz login e redireciona para os clubes", async ({ page }) => {
    await setupAuthMocks(page);

    await page.goto("/");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/\/login/);

    await fillLoginForm(page);

    await expect(page).toHaveURL(/\/clubes/);
  });

  test("mostra erro e permanece no login com credenciais inválidas", async ({
    page,
  }) => {
    await setupAuthMocks(page, { succeeds: false });

    await page.goto("/login");
    await fillLoginForm(page);

    await expect(page.getByText("Email ou senha inválidos")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
