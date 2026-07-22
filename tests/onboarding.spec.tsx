import { test, expect, type Page, type Route } from "@playwright/test";

const EMAIL = "e2e-onboarding@livrea.test";
const PASSWORD = "senha-e2e";
const USER_ID = "e2e-onboarding-user";

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

async function mockRoute(
  page: Page,
  pattern: string,
  resolver: (route: Route) => Promise<void> | void,
) {
  await page.route(pattern, async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }
    await resolver(route);
  });
}

type SetupOptions = {
  // valor de profiles.welcome_tour_seen que o backend "retorna"
  welcomeTourSeen?: boolean;
};

async function setupMocks(page: Page, opts: SetupOptions = {}) {
  const welcomeTourSeen = opts.welcomeTourSeen ?? false;
  const state = { markedSeen: false };

  await mockRoute(page, "**/auth/v1/token*", async (route) => {
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

  await mockRoute(page, "**/auth/v1/user*", async (route) => {
    await route.fulfill(jsonResponse(fakeUser));
  });

  await mockRoute(page, "**/rest/v1/rpc/get_my_profile*", async (route) => {
    await route.fulfill(
      jsonResponse({
        id: USER_ID,
        name: "Ana E2E Onboarding",
        bio: null,
        avatar_url: null,
        city: null,
        state: null,
        state_id: null,
        city_id: null,
        clubs: [],
        library: { read: [], reading: [], want_to_read: [] },
      }),
    );
  });

  await mockRoute(page, "**/rest/v1/rpc/list_clubs*", async (route) => {
    await route.fulfill(jsonResponse([]));
  });

  // O tour lê/escreve profiles.welcome_tour_seen direto (sem RPC): GET é o
  // maybeSingle do "já viu?"; PATCH é o "marcar como visto".
  await mockRoute(page, "**/rest/v1/profiles*", async (route) => {
    if (route.request().method() === "PATCH") {
      state.markedSeen = true;
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }
    await route.fulfill(jsonResponse({ welcome_tour_seen: welcomeTourSeen }));
  });

  return state;
}

async function login(page: Page) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(EMAIL);
  await page.getByRole("textbox", { name: "Senha" }).fill(PASSWORD);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.waitForURL("**/clubes");
}

test.describe("Onboarding (tour de boas-vindas)", () => {
  test("aparece no primeiro acesso, começando pelo primeiro passo", async ({
    page,
  }) => {
    await setupMocks(page, { welcomeTourSeen: false });
    await login(page);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: "Boas-vindas ao Livrea" }),
    ).toBeVisible();
  });

  test("avança, volta e finaliza marcando como visto", async ({ page }) => {
    const state = await setupMocks(page, { welcomeTourSeen: false });
    await login(page);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // primeiro passo: "Pular", sem "Voltar"
    await expect(dialog.getByRole("button", { name: "Pular" })).toBeVisible();

    await dialog.getByRole("button", { name: "Próximo" }).click();
    await expect(
      dialog.getByRole("heading", { name: "Clubes de leitura" }),
    ).toBeVisible();

    await dialog.getByRole("button", { name: "Voltar" }).click();
    await expect(
      dialog.getByRole("heading", { name: "Boas-vindas ao Livrea" }),
    ).toBeVisible();

    // avança até o último passo e finaliza
    for (let i = 0; i < 4; i++) {
      await dialog.getByRole("button", { name: "Próximo" }).click();
    }
    await dialog.getByRole("button", { name: "Começar a ler" }).click();

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect
      .poll(() => state.markedSeen, {
        message: "finalizar o tour deve marcar profiles.welcome_tour_seen",
      })
      .toBe(true);
  });

  test("pular fecha o tour e marca como visto", async ({ page }) => {
    const state = await setupMocks(page, { welcomeTourSeen: false });
    await login(page);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Pular" }).click();

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect.poll(() => state.markedSeen).toBe(true);
  });

  test("não aparece para quem já viu", async ({ page }) => {
    await setupMocks(page, { welcomeTourSeen: true });
    await login(page);

    // remonta o shell e espera o "já viu?" resolver antes de afirmar a ausência
    const seenResolved = page.waitForResponse((r) =>
      r.url().includes("/rest/v1/profiles"),
    );
    await page.goto("/clubes");
    await seenResolved;

    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("reabre com ?tour=1 mesmo já tendo visto e limpa a URL ao fechar", async ({
    page,
  }) => {
    await setupMocks(page, { welcomeTourSeen: true });
    await login(page);

    await page.goto("/clubes?tour=1");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Fechar tour" }).click();

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect.poll(() => new URL(page.url()).searchParams.has("tour")).toBe(
      false,
    );
  });
});
