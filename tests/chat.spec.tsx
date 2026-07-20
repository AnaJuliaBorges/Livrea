import { test, expect, type Page, type Route } from "@playwright/test";

const EMAIL = "e2e-chat@livrea.test";
const PASSWORD = "senha-e2e";
const USER_ID = "e2e-chat-user";

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

// JWT fake, apenas com formato válido — o cliente Supabase só o decodifica,
// não valida a assinatura no browser (mesma técnica dos outros specs).
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

function rawClubDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: "club-x",
    name: "Clube do Chat",
    description: "Descrição",
    rules: "Regras",
    cover_url: null,
    visibility: true,
    participant_limit: null,
    frequency: "monthly",
    custom_frequency: null,
    type: "in_person",
    meeting_description: null,
    city_id: 3509502,
    state_id: 26,
    city_name: "Campinas",
    state_sigla: "SP",
    member_count: 5,
    genres: [{ id: 1, name: "Fantasia" }],
    is_member: true,
    is_admin: false,
    is_owner: false,
    has_pending_request: false,
    header_color: null,
    current_reading: null,
    next_meeting: null,
    reading_history: [],
    ...overrides,
  };
}

function rawMessage(overrides: Record<string, unknown> = {}) {
  return {
    id: `msg-${Math.random().toString(36).slice(2)}`,
    content: "Oi, gente!",
    is_spoiler: false,
    hide_spoiler: false,
    created_at: nowIso,
    is_mine: false,
    author: {
      id: "other-user",
      name: "Bia Leitora",
      avatar_url: null,
      is_admin: false,
    },
    ...overrides,
  };
}

type SetupOptions = {
  isMember?: boolean;
  messages?: ReturnType<typeof rawMessage>[];
};

// `messages` é mutável de propósito: o mock de send_club_message insere a
// mensagem enviada, e o refetch de get_club_messages devolve a lista nova.
async function setupChatMocks(page: Page, opts: SetupOptions = {}) {
  const messages = opts.messages ?? [];

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
        name: "Ana E2E Chat",
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

  // registrado ANTES das rotas de mensagens de propósito: o Playwright
  // resolve rotas da última para a primeira, e o glob get_club* também
  // casaria com get_club_messages — as específicas precisam vencer
  await mockRoute(page, "**/rest/v1/rpc/get_club*", async (route) => {
    await route.fulfill(
      jsonResponse(rawClubDetail({ is_member: opts.isMember ?? true })),
    );
  });

  await mockRoute(page, "**/rest/v1/rpc/get_club_messages*", async (route) => {
    await route.fulfill(jsonResponse(messages));
  });

  await mockRoute(page, "**/rest/v1/rpc/send_club_message*", async (route) => {
    const body = route.request().postDataJSON() as {
      p_content: string;
      p_is_spoiler: boolean;
    };
    messages.push(
      rawMessage({
        content: body.p_content,
        is_spoiler: body.p_is_spoiler,
        is_mine: true,
        author: {
          id: USER_ID,
          name: "Ana E2E Chat",
          avatar_url: null,
          is_admin: false,
        },
      }),
    );
    await route.fulfill(jsonResponse(null));
  });

  // notificação de mensagem é fire-and-forget — só não pode dar erro
  await mockRoute(page, "**/functions/v1/send-push", async (route) => {
    await route.fulfill(jsonResponse({ ok: true }));
  });
}

async function login(page: Page) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(EMAIL);
  await page.getByRole("textbox", { name: "Senha" }).fill(PASSWORD);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.waitForURL("**/clubes");
}

test.describe("Chat do clube", () => {
  test("não-membro não acessa o chat", async ({ page }) => {
    await setupChatMocks(page, { isMember: false });
    await login(page);

    await page.goto("/clubes/club-x/chat");

    await expect(
      page.getByText("Só participantes do clube têm acesso ao chat."),
    ).toBeVisible();
  });

  test("membro vê o cabeçalho do clube e o estado vazio", async ({ page }) => {
    await setupChatMocks(page);
    await login(page);

    await page.goto("/clubes/club-x/chat");

    await expect(page.getByText("Clube do Chat")).toBeVisible();
    await expect(page.getByText("5 participantes")).toBeVisible();
    await expect(
      page.getByText("Nenhuma mensagem ainda. Comece a conversa!"),
    ).toBeVisible();
  });

  test("envia uma mensagem e a vê na conversa", async ({ page }) => {
    await setupChatMocks(page);
    await login(page);

    await page.goto("/clubes/club-x/chat");

    await page.getByPlaceholder("Mensagem").fill("Chegando no capítulo 5!");
    await page.getByRole("button", { name: "Enviar mensagem" }).click();

    await expect(page.getByText("Chegando no capítulo 5!")).toBeVisible();
  });

  test("spoiler chega borrado e é revelado no clique", async ({ page }) => {
    await setupChatMocks(page, {
      messages: [
        rawMessage({
          content: "O protagonista morre no final",
          is_spoiler: true,
          hide_spoiler: true,
        }),
      ],
    });
    await login(page);

    await page.goto("/clubes/club-x/chat");

    await expect(page.getByText("Alerta de spoiler")).toBeVisible();

    await page.getByRole("button", { name: "Revelar spoiler" }).click();

    await expect(page.getByText("Alerta de spoiler")).toBeHidden();
    await expect(
      page.getByText("O protagonista morre no final"),
    ).toBeVisible();
  });
});
