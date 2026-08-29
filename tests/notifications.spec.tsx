import { test, expect, type Page, type Route } from "@playwright/test";

const EMAIL = "e2e-notifications@livrea.test";
const PASSWORD = "senha-e2e";
const USER_ID = "e2e-notifications-user";

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

function rawNotification(overrides: Record<string, unknown> = {}) {
  return {
    id: `notif-${Math.random().toString(36).slice(2)}`,
    title: "Novo pedido no clube",
    body: "Bia Leitora pediu para participar.",
    url: "/meus-clubes",
    read: false,
    created_at: nowIso,
    ...overrides,
  };
}

type SetupOptions = {
  notifications?: ReturnType<typeof rawNotification>[];
};

async function setupNotificationMocks(page: Page, opts: SetupOptions = {}) {
  const notifications = opts.notifications ?? [];
  const state = { markedAllRead: false };

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

  await mockRoute(page, "**/rest/v1/profiles*", async (route) => {
    await route.fulfill(jsonResponse({ welcome_tour_seen: true }));
  });

  await mockRoute(page, "**/rest/v1/rpc/get_my_profile*", async (route) => {
    await route.fulfill(
      jsonResponse({
        id: USER_ID,
        name: "Ana E2E Notificações",
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

  await mockRoute(page, "**/rest/v1/notifications*", async (route) => {
    if (route.request().method() === "PATCH") {
      state.markedAllRead = true;
      for (const notification of notifications) notification.read = true;
      await route.fulfill(jsonResponse([]));
      return;
    }
    await route.fulfill(jsonResponse(notifications));
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

test.describe("Notificações", () => {
  test("mostra o estado vazio", async ({ page }) => {
    await setupNotificationMocks(page);
    await login(page);

    await page.goto("/notificacoes");

    await expect(
      page.getByText("Nenhuma notificação por aqui ainda."),
    ).toBeVisible();
  });

  test("lista notificações e marca todas como lidas ao abrir", async ({
    page,
  }) => {
    const state = await setupNotificationMocks(page, {
      notifications: [
        rawNotification(),
        rawNotification({
          title: "Pedido aprovado!",
          body: "Você entrou no Clube X.",
          read: true,
        }),
      ],
    });
    await login(page);

    await page.goto("/notificacoes");

    await expect(page.getByText("Novo pedido no clube")).toBeVisible();
    await expect(page.getByText("Pedido aprovado!")).toBeVisible();
    await expect
      .poll(() => state.markedAllRead, {
        message: "abrir a tela deve disparar o marcar-todas-como-lidas",
      })
      .toBe(true);
  });

  test("clicar numa notificação navega para a url dela", async ({ page }) => {
    await setupNotificationMocks(page, {
      notifications: [rawNotification({ url: "/meus-clubes" })],
    });
    await login(page);

    await page.goto("/notificacoes");

    await page.getByText("Novo pedido no clube").click();

    await page.waitForURL("**/meus-clubes");
  });
});
