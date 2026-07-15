import { test, expect, type Page, type Route } from "@playwright/test";

const EMAIL = "e2e-clubs@livrea.test";
const PASSWORD = "senha-e2e";
const USER_ID = "e2e-clubs-user";

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
// não valida a assinatura no browser (mesma técnica de tests/profile.spec.tsx).
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

// Registra uma rota tratando o preflight CORS automaticamente; `resolver`
// decide a resposta a partir do método/corpo da requisição real.
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

const emptyProfile = {
  id: USER_ID,
  name: "Ana E2E Clubes",
  bio: null,
  avatar_url: null,
  city: null,
  state: null,
  state_id: null,
  city_id: null,
  clubs: [],
  library: { read: [], reading: [], want_to_read: [] },
};

// Item cru retornado pela RPC list_clubs (campos em snake_case).
function rawClubListItem(overrides: Record<string, unknown> = {}) {
  return {
    id: "club-x",
    name: "Clube X",
    description: "",
    cover_url: null,
    visibility: true,
    participant_limit: null,
    frequency: "monthly",
    custom_frequency: null,
    type: "in_person",
    city_name: "Campinas",
    state_sigla: "SP",
    member_count: 5,
    genres: [{ id: 1, name: "Fantasia" }],
    is_member: false,
    is_admin: false,
    match_group: "other",
    ...overrides,
  };
}

// Detalhe cru retornado pela RPC get_club (campos em snake_case).
function rawClubDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: "club-x",
    name: "Clube X",
    description: "Descrição do clube X",
    rules: "Regras do clube X",
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
    is_member: false,
    is_admin: false,
    has_pending_request: false,
    current_reading: null,
    next_meeting: null,
    reading_history: [],
    ...overrides,
  };
}

type ClubsMockOptions = {
  browseClubs?: ReturnType<typeof rawClubListItem>[];
  myClubs?: ReturnType<typeof rawClubListItem>[];
  clubDetails?: Record<string, ReturnType<typeof rawClubDetail>>;
  genres?: { id: number; name: string; google_category: string[] | null }[];
  states?: { id: number; name: string; sigla: string }[];
  cities?: { id: number; name: string; state_id: number }[];
};

async function setupClubMocks(page: Page, opts: ClubsMockOptions = {}) {
  const browseClubs = opts.browseClubs ?? [];
  const myClubs = opts.myClubs ?? [];
  const clubDetails = opts.clubDetails ?? {};
  const genres = opts.genres ?? [
    { id: 1, name: "Fantasia", google_category: null },
  ];
  const states = opts.states ?? [{ id: 26, name: "São Paulo", sigla: "SP" }];
  const cities = opts.cities ?? [
    { id: 3509502, name: "Campinas", state_id: 26 },
  ];

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
    await route.fulfill(jsonResponse(emptyProfile));
  });

  await mockRoute(page, "**/rest/v1/profile_genres*", async (route) => {
    await route.fulfill(jsonResponse([]));
  });

  await mockRoute(page, "**/rest/v1/genres*", async (route) => {
    await route.fulfill(jsonResponse(genres));
  });

  await mockRoute(page, "**/rest/v1/states*", async (route) => {
    await route.fulfill(jsonResponse(states));
  });

  await mockRoute(page, "**/rest/v1/cities*", async (route) => {
    await route.fulfill(jsonResponse(cities));
  });

  await mockRoute(page, "**/rest/v1/rpc/list_clubs*", async (route) => {
    const body = route.request().postDataJSON() as { p_only_mine?: boolean };
    await route.fulfill(jsonResponse(body?.p_only_mine ? myClubs : browseClubs));
  });

  await mockRoute(page, "**/rest/v1/rpc/get_club*", async (route) => {
    const body = route.request().postDataJSON() as { p_club_id?: string };
    const club = body?.p_club_id ? clubDetails[body.p_club_id] : undefined;
    await route.fulfill(jsonResponse(club ?? null));
  });

  await mockRoute(
    page,
    "**/rest/v1/rpc/request_to_join_club*",
    async (route) => {
      await route.fulfill(jsonResponse(null));
    },
  );

  await mockRoute(page, "**/rest/v1/rpc/update_club*", async (route) => {
    await route.fulfill(jsonResponse(null));
  });

  await mockRoute(page, "**/rest/v1/rpc/delete_club*", async (route) => {
    await route.fulfill(jsonResponse(null));
  });
}

async function login(page: Page) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(EMAIL);
  await page.getByRole("textbox", { name: "Senha" }).fill(PASSWORD);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.waitForURL("**/clubes");
}

async function goToMyClubs(page: Page) {
  await page.getByRole("button", { name: "Clubes" }).click();
  await page.waitForURL("**/meus-clubes");
}

test.describe("Clubes", () => {
  test("redireciona para /login quando não autenticado", async ({ page }) => {
    await page.goto("/clubes");

    await page.waitForURL("**/login");
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
  });

  test("lista clubes públicos e privados, com cadeado só nos privados", async ({
    page,
  }) => {
    await setupClubMocks(page, {
      browseClubs: [
        rawClubListItem({ id: "club-public-1", name: "Clube Público E2E" }),
        rawClubListItem({
          id: "club-private-1",
          name: "Clube Privado E2E",
          visibility: false,
        }),
      ],
    });
    await login(page);

    await expect(page.getByText("Clube Público E2E")).toBeVisible();
    await expect(page.getByText("Clube Privado E2E")).toBeVisible();

    // só o clube privado mostra o ícone de cadeado
    await expect(page.locator('[aria-label="Clube privado"]')).toHaveCount(1);
  });

  test("pede para participar de um clube privado", async ({ page }) => {
    await setupClubMocks(page, {
      browseClubs: [
        rawClubListItem({
          id: "club-private-1",
          name: "Clube Privado E2E",
          visibility: false,
        }),
      ],
      clubDetails: {
        "club-private-1": rawClubDetail({
          id: "club-private-1",
          name: "Clube Privado E2E",
          visibility: false,
        }),
      },
    });
    await login(page);

    await page.getByText("Clube Privado E2E").click();
    await page.waitForURL("**/clubes/club-private-1");

    await expect(
      page.getByRole("button", { name: "Pedir para participar" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Pedir para participar" }).click();

    await expect(
      page.getByText("Pedido enviado! Aguarde a aprovação do administrador."),
    ).toBeVisible();
  });

  test("entra direto em um clube público", async ({ page }) => {
    await setupClubMocks(page, {
      browseClubs: [
        rawClubListItem({ id: "club-public-1", name: "Clube Público E2E" }),
      ],
      clubDetails: {
        "club-public-1": rawClubDetail({
          id: "club-public-1",
          name: "Clube Público E2E",
          visibility: true,
        }),
      },
    });
    await login(page);

    await page.getByText("Clube Público E2E").click();
    await page.waitForURL("**/clubes/club-public-1");

    await page.getByRole("button", { name: "Entrar no clube" }).click();

    await expect(page.getByText("Você entrou no clube!")).toBeVisible();
  });

  test("admin edita o nome do clube na tela de configurações", async ({
    page,
  }) => {
    await setupClubMocks(page, {
      myClubs: [
        rawClubListItem({
          id: "club-admin-1",
          name: "Clube Admin E2E",
          is_member: true,
          is_admin: true,
        }),
      ],
      clubDetails: {
        "club-admin-1": rawClubDetail({
          id: "club-admin-1",
          name: "Clube Admin E2E",
          is_member: true,
          is_admin: true,
        }),
      },
    });
    await login(page);
    await goToMyClubs(page);

    await page.getByText("Clube Admin E2E").click();
    await page.waitForURL("**/clubes/club-admin-1");

    await page.locator("svg.lucide-settings").click();
    await page.waitForURL("**/clubes/club-admin-1/configuracoes");

    const nameInput = page.getByPlaceholder("Nome do clube");
    await expect(nameInput).toHaveValue("Clube Admin E2E");

    await nameInput.fill("Clube Admin E2E Renomeado");
    await page.getByRole("button", { name: "Salvar alterações" }).click();

    await expect(page.getByText("Configurações salvas!")).toBeVisible();
    await page.waitForURL("**/clubes/club-admin-1");
  });

  test("admin exclui o clube pela tela de configurações", async ({
    page,
  }) => {
    await setupClubMocks(page, {
      myClubs: [
        rawClubListItem({
          id: "club-admin-1",
          name: "Clube Admin E2E",
          is_member: true,
          is_admin: true,
        }),
      ],
      clubDetails: {
        "club-admin-1": rawClubDetail({
          id: "club-admin-1",
          name: "Clube Admin E2E",
          is_member: true,
          is_admin: true,
        }),
      },
    });
    await login(page);
    await goToMyClubs(page);

    await page.getByText("Clube Admin E2E").click();
    await page.waitForURL("**/clubes/club-admin-1");

    await page.locator("svg.lucide-settings").click();
    await page.waitForURL("**/clubes/club-admin-1/configuracoes");

    await page.getByRole("button", { name: "Excluir clube" }).click();
    await page
      .getByRole("button", { name: "Excluir", exact: true })
      .click();

    await expect(page.getByText("Clube excluído.")).toBeVisible();
    await page.waitForURL("**/meus-clubes");
  });
});
