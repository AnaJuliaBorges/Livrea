import { test, expect, type Page } from "@playwright/test";

const EMAIL = "e2e@livrea.test";
const PASSWORD = "senha-e2e";
const USER_ID = "e2e-user";

// Perfil no formato cru retornado pela RPC get_my_profile (snake_case),
// interceptada nos testes para tornar as asserções determinísticas.
const rawProfile = {
  id: USER_ID,
  name: "Ana E2E Teste",
  bio: "Bio de teste e2e",
  avatar_url: null,
  city: "Campinas",
  state: "SP",
  state_id: 26,
  city_id: 3509502,
  clubs: [
    {
      id: "club-1",
      name: "Clube E2E da Fantasia",
      city: "Campinas",
      state: "SP",
      genres: ["Fantasia"],
      is_admin: true,
      participants: 12,
      participant_limit: 20,
    },
  ],
  library: {
    read: [
      {
        id: "book-1",
        title: "O Hobbit E2E",
        rating: 4.5,
        image_thumbnail: null,
        image_medium: null,
        image_large: null,
      },
      {
        id: "book-2",
        title: "Duna E2E",
        rating: null,
        image_thumbnail: null,
        image_medium: null,
        image_large: null,
      },
    ],
    reading: [
      {
        id: "book-3",
        title: "O Nome do Vento E2E",
        rating: null,
        image_thumbnail: null,
        image_medium: null,
        image_large: null,
      },
    ],
    want_to_read: [],
  },
};

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
  // sem expor content-range o browser não lê a contagem (count: exact)
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

// JWT fake, apenas com formato válido — o cliente Supabase só o decodifica,
// não valida a assinatura no browser.
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

function jsonResponse(body: unknown) {
  return {
    status: 200,
    headers: { ...corsHeaders, "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

// Intercepta os endpoints do Supabase usados pelo fluxo de perfil:
// login (token), usuário autenticado e a RPC get_my_profile.
async function setupMocks(page: Page, profile: unknown = rawProfile) {
  const preflight = async (route: {
    request: () => { method: () => string };
    fulfill: (r: object) => Promise<void>;
  }) => {
    await route.fulfill({ status: 204, headers: corsHeaders });
  };

  await page.route("**/auth/v1/token*", async (route) => {
    if (route.request().method() === "OPTIONS") return preflight(route);

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

  await page.route("**/rest/v1/rpc/get_my_profile*", async (route) => {
    if (route.request().method() === "OPTIONS") return preflight(route);
    await route.fulfill(jsonResponse(profile));
  });

  // endpoints novos usados pela página de perfil — sem mock, as queries
  // batem na rede de verdade e atrasam os testes com retries
  await page.route("**/rest/v1/rpc/get_profile_header_color*", async (route) => {
    if (route.request().method() === "OPTIONS") return preflight(route);
    await route.fulfill(jsonResponse("purple"));
  });

  await page.route("**/rest/v1/notifications*", async (route) => {
    if (route.request().method() === "OPTIONS") return preflight(route);
    await route.fulfill(jsonResponse([]));
  });

  // follows: HEAD = contagem de seguidores, GET = maybeSingle do "eu sigo?"
  await page.route("**/rest/v1/follows*", async (route) => {
    const method = route.request().method();
    if (method === "OPTIONS") return preflight(route);
    if (method === "HEAD") {
      await route.fulfill({
        status: 200,
        headers: { ...corsHeaders, "content-range": "*/0" },
      });
      return;
    }
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

// Navega para /perfil pelo menu (client-side) em vez de um full page load,
// que sob paralelismo estoura o timeout no dev server do Vite.
async function goToProfile(page: Page) {
  await page.getByRole("button", { name: "Perfil" }).click();
  await page.waitForURL("**/perfil");
}

test.describe("Perfil", () => {
  test("redireciona para /login quando não autenticado", async ({ page }) => {
    await page.goto("/perfil");

    await page.waitForURL("**/login");
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
  });

  test("exibe os dados do perfil do usuário logado", async ({ page }) => {
    await setupMocks(page);
    await login(page);
    await goToProfile(page);

    await expect(page.getByText("Ana E2E Teste")).toBeVisible();
    await expect(page.getByText('"Bio de teste e2e"')).toBeVisible();

    // contadores do topo: 2 livros lidos e os follows (mock devolve 0)
    await expect(
      page.getByText("livros lidos", { exact: true }).locator(".."),
    ).toContainText("2");
    await expect(
      page.getByText("seguidores", { exact: true }).locator(".."),
    ).toContainText("0");

    // a contagem de clubes vive no rótulo da aba
    await expect(
      page.getByRole("tab", { name: "Meus clubes (1)" }),
    ).toBeVisible();

    // aba padrão lista os clubes
    await expect(page.getByText("Clube E2E da Fantasia")).toBeVisible();
    await expect(page.getByText("administrador")).toBeVisible();
  });

  test("mostra mensagem quando o usuário não participa de clubes", async ({
    page,
  }) => {
    await setupMocks(page, { ...rawProfile, clubs: [] });
    await login(page);
    await goToProfile(page);

    await expect(
      page.getByText("Você ainda não participa de nenhum clube."),
    ).toBeVisible();
  });

  test("alterna para a aba Meus livros e filtra pelas tags", async ({
    page,
  }) => {
    await setupMocks(page);
    await login(page);
    await goToProfile(page);

    await page.getByRole("tab", { name: "Meus livros" }).click();

    // tag padrão: Lido
    await expect(page.getByText("O Hobbit E2E")).toBeVisible();
    await expect(page.getByText("Duna E2E")).toBeVisible();

    await page.getByText("Lendo", { exact: true }).click();
    await expect(page.getByText("O Nome do Vento E2E")).toBeVisible();
    await expect(page.getByText("O Hobbit E2E")).not.toBeVisible();

    await page.getByText("Quero ler", { exact: true }).click();
    await expect(
      page.getByText("Nenhum livro nesta lista ainda."),
    ).toBeVisible();
  });

  test("abre a edição de perfil com o formulário pré-preenchido", async ({
    page,
  }) => {
    await setupMocks(page);
    await login(page);
    await goToProfile(page);

    await expect(page.getByText("Ana E2E Teste")).toBeVisible();

    await page.locator("svg.lucide-settings").click();

    await page.waitForURL("**/perfil/editar");
    await expect(page.getByPlaceholder("Nome")).toHaveValue("Ana E2E Teste");
    await expect(page.getByPlaceholder("Biografia")).toHaveValue(
      "Bio de teste e2e",
    );
    await expect(page.getByPlaceholder("Email")).toHaveValue(EMAIL);
  });

  test("altera a cor do cabeçalho do perfil e salva", async ({ page }) => {
    await setupMocks(page);

    // captura o corpo do update em profiles pra conferir a cor enviada
    let patchBody: Record<string, unknown> | null = null;
    await page.route("**/rest/v1/profiles*", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({ status: 204, headers: corsHeaders });
        return;
      }
      if (route.request().method() === "PATCH") {
        patchBody = route.request().postDataJSON() as Record<string, unknown>;
      }
      await route.fulfill(jsonResponse([]));
    });

    await login(page);
    await goToProfile(page);
    await page.locator("svg.lucide-settings").click();
    await page.waitForURL("**/perfil/editar");

    await page.getByRole("button", { name: "Azul" }).click();
    await page.getByRole("button", { name: "Salvar alterações" }).click();

    await expect(page.getByText("Perfil atualizado!")).toBeVisible();
    await expect.poll(() => patchBody?.header_color).toBe("blue");
  });
});
