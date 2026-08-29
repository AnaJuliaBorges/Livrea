import { test, expect, type Page, type Route } from "@playwright/test";

const EMAIL = "e2e-clubs@livrea.test";
const PASSWORD = "senha-e2e";
const USER_ID = "e2e-clubs-user";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
  "access-control-expose-headers": "content-range",
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
    is_owner: false,
    has_pending_request: false,
    header_color: null,
    current_reading: null,
    next_meeting: null,
    reading_history: [],
    ...overrides,
  };
}

function rawUserProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-y",
    name: "Usuário Y",
    bio: null,
    avatar_url: null,
    city: null,
    state: null,
    state_id: null,
    city_id: null,
    clubs: [],
    library: { read: [], reading: [], want_to_read: [] },
    ...overrides,
  };
}

type ClubsMockOptions = {
  browseClubs?: ReturnType<typeof rawClubListItem>[];
  myClubs?: ReturnType<typeof rawClubListItem>[];
  clubDetails?: Record<string, ReturnType<typeof rawClubDetail>>;
  clubMembers?: Record<
    string,
    {
      id: string;
      name: string;
      avatar_url: string | null;
      is_admin: boolean;
      is_owner: boolean;
    }[]
  >;
  userProfiles?: Record<string, ReturnType<typeof rawUserProfile>>;
  genres?: { id: number; name: string; google_category: string[] | null }[];
  states?: { id: number; name: string; sigla: string }[];
  cities?: { id: number; name: string; state_id: number }[];
  profileGenreRows?: { genre_id: number }[];
};

async function setupClubMocks(page: Page, opts: ClubsMockOptions = {}) {
  const browseClubs = opts.browseClubs ?? [];
  const myClubs = opts.myClubs ?? [];
  const clubDetails = opts.clubDetails ?? {};
  const clubMembers = opts.clubMembers ?? {};
  const userProfiles = opts.userProfiles ?? {};
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

  await mockRoute(page, "**/rest/v1/profiles*", async (route) => {
    await route.fulfill(jsonResponse({ welcome_tour_seen: true }));
  });

  await mockRoute(page, "**/rest/v1/rpc/get_my_profile*", async (route) => {
    await route.fulfill(jsonResponse(emptyProfile));
  });

  await mockRoute(page, "**/rest/v1/profile_genres*", async (route) => {
    await route.fulfill(jsonResponse(opts.profileGenreRows ?? []));
  });

  await mockRoute(page, "**/rest/v1/notifications*", async (route) => {
    await route.fulfill(jsonResponse([]));
  });

  await mockRoute(page, "**/rest/v1/follows*", async (route) => {
    const method = route.request().method();
    if (method === "HEAD") {
      await route.fulfill({
        status: 200,
        headers: { ...corsHeaders, "content-range": "*/0" },
      });
      return;
    }
    if (method === "GET") {
      await route.fulfill(jsonResponse(null));
      return;
    }
    await route.fulfill({ status: 204, headers: corsHeaders });
  });

  await mockRoute(
    page,
    "**/rest/v1/rpc/get_profile_header_color*",
    async (route) => {
      await route.fulfill(jsonResponse("purple"));
    },
  );

  await mockRoute(page, "**/functions/v1/send-push*", async (route) => {
    await route.fulfill(jsonResponse({ ok: true }));
  });

  await mockRoute(page, "**/rest/v1/rpc/leave_club*", async (route) => {
    await route.fulfill(jsonResponse(null));
  });

  await mockRoute(
    page,
    "**/rest/v1/rpc/set_club_header_color*",
    async (route) => {
      await route.fulfill(jsonResponse(null));
    },
  );

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

  await mockRoute(page, "**/rest/v1/rpc/get_club_members*", async (route) => {
    const body = route.request().postDataJSON() as { p_club_id?: string };
    const members = body?.p_club_id ? clubMembers[body.p_club_id] : undefined;
    await route.fulfill(jsonResponse(members ?? []));
  });

  await mockRoute(page, "**/rest/v1/rpc/get_user_profile*", async (route) => {
    const body = route.request().postDataJSON() as { p_user_id?: string };
    const profile = body?.p_user_id ? userProfiles[body.p_user_id] : undefined;
    await route.fulfill(jsonResponse(profile ?? null));
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

  await mockRoute(page, "**/rest/v1/rpc/promote_club_member*", async (route) => {
    await route.fulfill(jsonResponse(null));
  });

  await mockRoute(page, "**/rest/v1/rpc/demote_club_member*", async (route) => {
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
          is_owner: true,
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

  test("clica em um participante e vê o perfil dele, somente leitura", async ({
    page,
  }) => {
    await setupClubMocks(page, {
      browseClubs: [
        rawClubListItem({ id: "club-1", name: "Clube Y" }),
      ],
      clubDetails: {
        "club-1": rawClubDetail({ id: "club-1", name: "Clube Y" }),
      },
      clubMembers: {
        "club-1": [
          {
            id: "user-2",
            name: "Lucas Martins",
            avatar_url: null,
            is_admin: false,
            is_owner: false,
          },
        ],
      },
      userProfiles: {
        "user-2": rawUserProfile({
          id: "user-2",
          name: "Lucas Martins",
          city: "Campinas",
          state: "SP",
        }),
      },
    });
    await login(page);

    await page.getByText("Clube Y").click();
    await page.waitForURL("**/clubes/club-1");

    await page.getByRole("tab", { name: "Participantes" }).click();
    await page.getByText("Lucas Martins").click();

    await page.waitForURL("**/perfil/user-2");
    await expect(page.getByText("Lucas Martins")).toBeVisible();
    await expect(page.locator("svg.lucide-settings")).toHaveCount(0);
  });

  test("o dono promove um participante a admin", async ({ page }) => {
    await setupClubMocks(page, {
      myClubs: [
        rawClubListItem({
          id: "club-own-1",
          name: "Clube do Dono E2E",
          is_member: true,
          is_admin: true,
        }),
      ],
      clubDetails: {
        "club-own-1": rawClubDetail({
          id: "club-own-1",
          name: "Clube do Dono E2E",
          is_member: true,
          is_admin: true,
          is_owner: true,
        }),
      },
      clubMembers: {
        "club-own-1": [
          {
            id: USER_ID,
            name: "Ana E2E Clubes",
            avatar_url: null,
            is_admin: true,
            is_owner: true,
          },
          {
            id: "user-2",
            name: "Lucas Martins",
            avatar_url: null,
            is_admin: false,
            is_owner: false,
          },
        ],
      },
    });
    await login(page);
    await goToMyClubs(page);

    await page.getByText("Clube do Dono E2E").click();
    await page.waitForURL("**/clubes/club-own-1");

    await page.getByRole("tab", { name: "Participantes" }).click();

    await expect(
      page.getByRole("button", { name: "Tornar admin" }),
    ).toHaveCount(1);

    await page.getByRole("button", { name: "Tornar admin" }).click();

    await expect(
      page.getByText("Lucas Martins agora é administrador do clube!"),
    ).toBeVisible();
  });

  test("com sessão ativa, home e login redirecionam pra lista de clubes", async ({
    page,
  }) => {
    await setupClubMocks(page);
    await login(page);

    await page.goto("/");
    await page.waitForURL("**/clubes");

    await page.goto("/login");
    await page.waitForURL("**/clubes");
  });

  test("membro sai do clube pela aba Participantes", async ({ page }) => {
    await setupClubMocks(page, {
      myClubs: [
        rawClubListItem({
          id: "club-leave-1",
          name: "Clube pra Sair E2E",
          is_member: true,
        }),
      ],
      clubDetails: {
        "club-leave-1": rawClubDetail({
          id: "club-leave-1",
          name: "Clube pra Sair E2E",
          is_member: true,
        }),
      },
      clubMembers: {
        "club-leave-1": [
          {
            id: USER_ID,
            name: "Ana E2E Clubes",
            avatar_url: null,
            is_admin: false,
            is_owner: false,
          },
        ],
      },
    });
    await login(page);
    await goToMyClubs(page);

    await page.getByText("Clube pra Sair E2E").click();
    await page.waitForURL("**/clubes/club-leave-1");

    await page.getByRole("tab", { name: "Participantes" }).click();
    await page.getByRole("button", { name: "Sair do clube" }).click();

    await page.getByRole("button", { name: "Sair", exact: true }).click();

    await expect(page.getByText("Você saiu do clube.")).toBeVisible();
    await page.waitForURL("**/clubes");
  });

  test("segue e deixa de seguir um participante pelo perfil", async ({
    page,
  }) => {
    await setupClubMocks(page, {
      browseClubs: [rawClubListItem({ id: "club-1", name: "Clube Y" })],
      clubDetails: {
        "club-1": rawClubDetail({ id: "club-1", name: "Clube Y" }),
      },
      clubMembers: {
        "club-1": [
          {
            id: "user-2",
            name: "Lucas Martins",
            avatar_url: null,
            is_admin: false,
            is_owner: false,
          },
        ],
      },
      userProfiles: {
        "user-2": rawUserProfile({ id: "user-2", name: "Lucas Martins" }),
      },
    });

    let isFollowing = false;
    await mockRoute(page, "**/rest/v1/follows*", async (route) => {
      const method = route.request().method();
      if (method === "HEAD") {
        await route.fulfill({
          status: 200,
          headers: {
            ...corsHeaders,
            "content-range": isFollowing ? "0-0/1" : "*/0",
          },
        });
        return;
      }
      if (method === "GET") {
        await route.fulfill(
          jsonResponse(isFollowing ? { follower_id: USER_ID } : null),
        );
        return;
      }
      if (method === "POST") {
        isFollowing = true;
        await route.fulfill({ status: 201, headers: corsHeaders });
        return;
      }
      if (method === "DELETE") {
        isFollowing = false;
        await route.fulfill({ status: 204, headers: corsHeaders });
        return;
      }
      await route.fulfill(jsonResponse(null));
    });

    await login(page);

    await page.getByText("Clube Y").click();
    await page.waitForURL("**/clubes/club-1");

    await page.getByRole("tab", { name: "Participantes" }).click();
    await page.getByText("Lucas Martins").click();
    await page.waitForURL("**/perfil/user-2");

    const followButton = page.getByRole("button", { name: "Seguir" });
    await expect(followButton).toBeEnabled();
    await followButton.click();

    const unfollowButton = page.getByRole("button", {
      name: "Deixar de seguir",
    });
    await expect(unfollowButton).toBeVisible();
    await expect(
      page.getByText("seguidores", { exact: true }).locator(".."),
    ).toContainText("1");

    await unfollowButton.click();
    await expect(page.getByRole("button", { name: "Seguir" })).toBeVisible();
  });

  test("compartilha o link do clube copiando pra área de transferência", async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "permissão de clipboard só é controlável no Chromium",
    );

    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", { value: undefined });
    });

    await setupClubMocks(page, {
      browseClubs: [rawClubListItem({ id: "club-share-1", name: "Clube Z" })],
      clubDetails: {
        "club-share-1": rawClubDetail({ id: "club-share-1", name: "Clube Z" }),
      },
    });
    await login(page);

    await page.getByText("Clube Z").click();
    await page.waitForURL("**/clubes/club-share-1");

    await page
      .getByRole("button", { name: "Compartilhar clube" })
      .first()
      .click();

    await expect(page.getByText("Link do clube copiado!")).toBeVisible();

    const clipboard = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(clipboard).toContain("/clubes/club-share-1");
  });

  test("busca ignora acentos e esconde os clubes indicados", async ({
    page,
  }) => {
    await setupClubMocks(page, {
      browseClubs: [
        rawClubListItem({
          id: "club-acc-1",
          name: "Clube da Fantásia Épica",
          genres: [{ id: 1, name: "Fantasia" }],
        }),
      ],
      profileGenreRows: [{ genre_id: 1 }],
    });
    await login(page);

    await expect(page.getByText("Clubes indicados pra você")).toBeVisible();

    await page.getByPlaceholder("Buscar clubes").fill("fantasia");
    await expect(
      page.getByText("Clubes indicados pra você"),
    ).not.toBeVisible();
    await expect(page.getByText("Clube da Fantásia Épica")).toBeVisible();

    await page.getByPlaceholder("Buscar clubes").fill("inexistente");
    await expect(page.getByText("❌ Nenhum clube encontrado")).toBeVisible();
  });

  test("abre o chat do clube, revela spoiler e envia mensagem", async ({
    page,
  }) => {
    await setupClubMocks(page, {
      myClubs: [
        rawClubListItem({
          id: "club-chat-1",
          name: "Clube do Chat E2E",
          is_member: true,
        }),
      ],
      clubDetails: {
        "club-chat-1": rawClubDetail({
          id: "club-chat-1",
          name: "Clube do Chat E2E",
          is_member: true,
        }),
      },
    });

    const chatMessages: Record<string, unknown>[] = [
      {
        id: "msg-1",
        content: "Terminei o capítulo 5!",
        is_spoiler: false,
        hide_spoiler: false,
        created_at: new Date().toISOString(),
        is_mine: false,
        author: {
          id: "user-2",
          name: "Lucas Martins",
          avatar_url: null,
          is_admin: true,
        },
      },
      {
        id: "msg-2",
        content: "O dragão morre no final",
        is_spoiler: true,
        hide_spoiler: true,
        created_at: new Date().toISOString(),
        is_mine: false,
        author: {
          id: "user-3",
          name: "Maria Lourdes",
          avatar_url: null,
          is_admin: false,
        },
      },
    ];

    await mockRoute(page, "**/rest/v1/rpc/get_club_messages*", async (route) => {
      await route.fulfill(jsonResponse(chatMessages));
    });

    await mockRoute(page, "**/rest/v1/rpc/send_club_message*", async (route) => {
      const body = route.request().postDataJSON() as {
        p_content?: string;
        p_is_spoiler?: boolean;
      };
      chatMessages.push({
        id: `msg-${chatMessages.length + 1}`,
        content: body?.p_content ?? "",
        is_spoiler: body?.p_is_spoiler ?? false,
        hide_spoiler: false,
        created_at: new Date().toISOString(),
        is_mine: true,
        author: {
          id: USER_ID,
          name: "Ana E2E Clubes",
          avatar_url: null,
          is_admin: false,
        },
      });
      await route.fulfill(jsonResponse(null));
    });

    await login(page);
    await goToMyClubs(page);

    await page.getByText("Clube do Chat E2E").click();
    await page.waitForURL("**/clubes/club-chat-1");

    await page.getByRole("button", { name: "Chat do clube" }).click();
    await page.waitForURL("**/clubes/club-chat-1/chat");

    await expect(page.getByText("Terminei o capítulo 5!")).toBeVisible();
    await expect(page.getByText("Lucas Martins")).toBeVisible();
    await expect(page.getByText("Administrador ✓")).toBeVisible();

    await expect(page.getByText("Alerta de spoiler")).toBeVisible();
    await page.getByRole("button", { name: "Revelar spoiler" }).click();
    await expect(page.getByText("Alerta de spoiler")).not.toBeVisible();
    await expect(page.getByText("O dragão morre no final")).toBeVisible();

    await page.getByPlaceholder("Mensagem", { exact: true }).fill("Olá pessoal!");
    await page.getByRole("button", { name: "Enviar mensagem" }).click();

    await expect(page.getByText("Olá pessoal!")).toBeVisible();
  });

  test("filtra a lista por tipo, gênero e privacidade", async ({ page }) => {
    await setupClubMocks(page, {
      browseClubs: [
        rawClubListItem({
          id: "club-f1",
          name: "Clube Online Fantasia",
          type: "online",
          visibility: true,
          genres: [{ id: 1, name: "Fantasia" }],
        }),
        rawClubListItem({
          id: "club-f2",
          name: "Clube Presencial Mistério",
          type: "in_person",
          visibility: false,
          genres: [{ id: 2, name: "Mistério" }],
        }),
      ],
      genres: [
        { id: 1, name: "Fantasia", google_category: null },
        { id: 2, name: "Mistério", google_category: null },
      ],
    });
    await login(page);

    await expect(page.getByText("Clube Online Fantasia")).toBeVisible();
    await expect(page.getByText("Clube Presencial Mistério")).toBeVisible();

    await page.getByLabel("Filtrar por tipo").click();
    await page.getByRole("option", { name: "Online" }).click();
    await expect(page.getByText("Clube Presencial Mistério")).not.toBeVisible();
    await expect(page.getByText("Clube Online Fantasia")).toBeVisible();

    await page.getByLabel("Filtrar por tipo").click();
    await page.getByRole("option", { name: "Todos os tipos" }).click();

    await page.getByLabel("Filtrar por gênero").click();
    await page.getByRole("option", { name: "Mistério" }).click();
    await expect(page.getByText("Clube Online Fantasia")).not.toBeVisible();
    await expect(page.getByText("Clube Presencial Mistério")).toBeVisible();

    await page.getByLabel("Filtrar por gênero").click();
    await page.getByRole("option", { name: "Todos os gêneros" }).click();

    await page.getByLabel("Filtrar por privacidade").click();
    await page.getByRole("option", { name: "Privado" }).click();
    await expect(page.getByText("Clube Online Fantasia")).not.toBeVisible();
    await expect(page.getByText("Clube Presencial Mistério")).toBeVisible();
  });

  test("admin altera a cor do cabeçalho do clube", async ({ page }) => {
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

    let sentColor: string | null = null;
    await mockRoute(
      page,
      "**/rest/v1/rpc/set_club_header_color*",
      async (route) => {
        const body = route.request().postDataJSON() as { p_color?: string };
        sentColor = body?.p_color ?? null;
        await route.fulfill(jsonResponse(null));
      },
    );

    await login(page);
    await goToMyClubs(page);

    await page.getByText("Clube Admin E2E").click();
    await page.waitForURL("**/clubes/club-admin-1");

    await page.locator("svg.lucide-settings").click();
    await page.waitForURL("**/clubes/club-admin-1/configuracoes");

    await page.getByRole("button", { name: "Azul" }).click();
    await page.getByRole("button", { name: "Salvar alterações" }).click();

    await expect(page.getByText("Configurações salvas!")).toBeVisible();
    await expect.poll(() => sentColor).toBe("blue");
  });

  test("no criar clube, o voltar retorna um passo mantendo os dados", async ({
    page,
  }) => {
    await setupClubMocks(page);
    await login(page);

    await page.goto("/meus-clubes/criar");

    await page.getByPlaceholder("Nome").fill("Clube Wizard E2E");
    await page.getByPlaceholder("Descrição").fill("Descrição do wizard");
    await page.getByPlaceholder("Regras").fill("Regras do wizard");
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(
      page.getByText("Configure como serão os encontros do clube"),
    ).toBeVisible();

    await page.locator("button:has(svg.lucide-arrow-left)").first().click();

    await expect(
      page.getByText("Configurações iniciais do seu Clube do Livro"),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Nome")).toHaveValue(
      "Clube Wizard E2E",
    );
  });
});
