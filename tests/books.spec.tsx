import { test, expect, type Page, type Route } from "@playwright/test";

const EMAIL = "e2e-books@livrea.test";
const PASSWORD = "senha-e2e";
const USER_ID = "e2e-books-user";

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
// decide a resposta a partir do método/URL da requisição real.
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

const dbBookRow = {
  id: "book-db-1",
  isbn: "1111111111",
  title_original: "Duna (original)",
  title_pt: "Duna",
  image_thumbnail: "duna-thumb.jpg",
  image_medium: "duna-medium.jpg",
};

const isbndbGenreBook = {
  isbn: "2222222222",
  isbn13: "2222222222",
  title: "Neuromancer",
};

const isbndbQueryBook = {
  isbn: "3333333333",
  isbn13: "3333333333",
  title: "Fundação",
};

function completeBookRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "book-ext-1",
    isbn: "2222222222",
    title_original: "Neuromancer",
    title_pt: null,
    subtitle: null,
    authors: ["William Gibson"],
    synopsis: "<p>Sinopse de Neuromancer</p>",
    publisher: "Aleph",
    publisher_date: "1984-01-01",
    total_pages: 350,
    image_small_thumbnail: "small.jpg",
    image_thumbnail: "thumb.jpg",
    image_medium: "medium.jpg",
    image_large: "large.jpg",
    global_average_rating: 4.5,
    global_count_rating: 20,
    local_average_rating: null,
    local_count_rating: null,
    secondary_genre: [],
    subjects: ["Science Fiction"],
    primary_genre: { id: 1, name: "Ficção Científica" },
    ...overrides,
  };
}

type BookMockOptions = {
  genres?: { id: number; name: string; google_category: string[] | null }[];
  profileGenreIds?: { genre_id: number }[];
  dbBooks?: (typeof dbBookRow)[];
  isbndbGenreBooks?: (typeof isbndbGenreBook)[];
  isbndbQueryBooks?: (typeof isbndbQueryBook)[];
  bookRow?: ReturnType<typeof completeBookRow>;
  userLibraryStatus?: { status: string } | null;
  tracking?: { current_page: number; rating: number | null; review: string | null } | null;
  logs?: { id: string; pages_read: number; feeling: string; created_at: string }[];
  highlights?: { id: string; page: number; quote: string }[];
  reviews?: unknown[];
  upsertedBookId?: string;
};

async function setupBookMocks(page: Page, opts: BookMockOptions = {}) {
  const genres = opts.genres ?? [
    { id: 1, name: "Fantasia", google_category: ["Fiction/Fantasy"] },
  ];
  const profileGenreIds = opts.profileGenreIds ?? [{ genre_id: 1 }];
  const dbBooks = opts.dbBooks ?? [dbBookRow];
  const isbndbGenreBooks = opts.isbndbGenreBooks ?? [isbndbGenreBook];
  const isbndbQueryBooks = opts.isbndbQueryBooks ?? [isbndbQueryBook];
  const bookRow = opts.bookRow ?? completeBookRow();
  // mutável: refletir upserts/deletes feitos durante o teste, já que o
  // hook de status invalida e refaz a busca logo após salvar (onSettled)
  let userLibraryStatus: { status: string } | null =
    opts.userLibraryStatus === undefined ? null : opts.userLibraryStatus;
  const tracking = opts.tracking === undefined ? null : opts.tracking;
  const logs = opts.logs ?? [];
  const highlights = opts.highlights ?? [];
  const reviews = opts.reviews ?? [];
  const upsertedBookId = opts.upsertedBookId ?? "book-ext-1";

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

  // WelcomeTour lê profiles.welcome_tour_seen ao entrar no shell logado.
  // Fixamos "já visto" para o tour não abrir por cima destes fluxos (senão
  // dependeria da requisição falhar na rede fake, o que é frágil).
  await mockRoute(page, "**/rest/v1/profiles*", async (route) => {
    await route.fulfill(jsonResponse({ welcome_tour_seen: true }));
  });

  await mockRoute(page, "**/rest/v1/profile_genres*", async (route) => {
    await route.fulfill(jsonResponse(profileGenreIds));
  });

  await mockRoute(page, "**/rest/v1/genres*", async (route) => {
    await route.fulfill(jsonResponse(genres));
  });

  // a ISBNDB agora é chamada via Edge Function (proxy que esconde a chave);
  // a action no corpo diz qual endpoint upstream seria usado
  await mockRoute(page, "**/functions/v1/isbndb", async (route) => {
    const { action } = (route.request().postDataJSON() ?? {}) as {
      action?: string;
    };

    if (action === "subject") {
      await route.fulfill(jsonResponse({ books: isbndbGenreBooks, total: isbndbGenreBooks.length }));
    } else if (action === "books") {
      await route.fulfill(jsonResponse({ books: isbndbQueryBooks, total: isbndbQueryBooks.length }));
    } else {
      await route.fulfill(jsonResponse({ book: null }));
    }
  });

  await mockRoute(page, "https://www.googleapis.com/books/v1/**", async (route) => {
    await route.fulfill(jsonResponse({ items: [] }));
  });

  await mockRoute(page, "**/rest/v1/rpc/upsert_book*", async (route) => {
    await route.fulfill(jsonResponse(upsertedBookId));
  });

  await mockRoute(page, "**/rest/v1/rpc/get_book*", async (route) => {
    await route.fulfill(jsonResponse(bookRow));
  });

  await mockRoute(page, "**/rest/v1/rpc/complete_book_data*", async (route) => {
    await route.fulfill(jsonResponse(null));
  });

  await mockRoute(page, "**/rest/v1/rpc/get_book_reviews*", async (route) => {
    await route.fulfill(jsonResponse(reviews));
  });

  // recomendação do banco vem da RPC get_books_by_genres (a RLS de books
  // bloqueia SELECT direto do client). PRECISA ser registrada DEPOIS de
  // get_book*: o glob "get_book*" também casa com "get_books_by_genres" e, no
  // Playwright, a rota registrada por último é avaliada primeiro — sem isso o
  // handler de get_book intercepta a chamada e devolve um objeto único, que
  // estoura o .map() em getBooksByGenres e some com os recomendados do banco.
  await mockRoute(
    page,
    "**/rest/v1/rpc/get_books_by_genres*",
    async (route) => {
      await route.fulfill(jsonResponse(dbBooks));
    },
  );

  await mockRoute(page, "**/rest/v1/user_library*", async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();

    if (method === "GET" && url.includes("select=status")) {
      await route.fulfill(jsonResponse(userLibraryStatus));
      return;
    }
    if (method === "GET" && url.includes("current_page")) {
      await route.fulfill(jsonResponse(tracking));
      return;
    }
    if (method === "POST") {
      const body = request.postDataJSON() as { status?: string };
      if (body?.status) {
        userLibraryStatus = { status: body.status };
      }
      await route.fulfill(jsonResponse([{}]));
      return;
    }
    if (method === "DELETE") {
      userLibraryStatus = null;
      await route.fulfill(jsonResponse([]));
      return;
    }
    // PATCH (progresso, avaliação)
    await route.fulfill(jsonResponse([{}]));
  });

  await mockRoute(page, "**/rest/v1/reading_logs*", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill(jsonResponse(logs));
      return;
    }
    await route.fulfill(jsonResponse([{}]));
  });

  await mockRoute(page, "**/rest/v1/book_highlights*", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill(jsonResponse(highlights));
      return;
    }
    await route.fulfill(jsonResponse([{}]));
  });
}

async function login(page: Page) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(EMAIL);
  await page.getByRole("textbox", { name: "Senha" }).fill(PASSWORD);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.waitForURL("**/clubes");
}

async function goToBooks(page: Page) {
  await page.getByRole("button", { name: "Livros" }).click();
  await page.waitForURL("**/livros");
}

test.describe("Livros", () => {
  test("redireciona para /login quando não autenticado", async ({ page }) => {
    await page.goto("/livros");

    await page.waitForURL("**/login");
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
  });

  test("lista os livros recomendados a partir dos gêneros do perfil e do banco", async ({
    page,
  }) => {
    await setupBookMocks(page);
    await login(page);
    await goToBooks(page);

    await expect(page.getByText("Recomendados para você")).toBeVisible();
    await expect(page.getByText("Duna")).toBeVisible();
    await expect(page.getByText("Neuromancer")).toBeVisible();
  });

  test("mostra aviso quando o usuário não tem gêneros favoritos", async ({
    page,
  }) => {
    await setupBookMocks(page, { profileGenreIds: [], dbBooks: [] });
    await login(page);
    await goToBooks(page);

    await expect(
      page.getByText("Você ainda não tem gêneros favoritos."),
    ).toBeVisible();
  });

  test("busca livros por texto", async ({ page }) => {
    await setupBookMocks(page);
    await login(page);
    await goToBooks(page);

    await page.getByPlaceholder("Buscar livros").fill("fundação");

    await expect(page.getByText("Resultados da busca")).toBeVisible();
    await expect(page.getByText("Fundação")).toBeVisible();
  });

  test("abre um livro recomendado do banco e altera o status para Lido", async ({
    page,
  }) => {
    await setupBookMocks(page);
    await login(page);
    await goToBooks(page);

    await page.getByText("Duna").click();
    await page.waitForURL("**/livros/book-db-1");

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Lido", exact: true }).click();

    await expect(page.getByRole("combobox")).toContainText("Lido");
    await expect(page.getByText("Sua leitura")).toBeVisible();
  });

  test("abre um livro externo (ainda não salvo) e cria o registro ao clicar", async ({
    page,
  }) => {
    await setupBookMocks(page, { upsertedBookId: "book-ext-1" });
    await login(page);
    await goToBooks(page);

    await page.getByText("Neuromancer").click();
    await page.waitForURL("**/livros/book-ext-1");

    await expect(page.getByText("William Gibson")).toBeVisible();
    await expect(page.getByText("Sinopse de Neuromancer")).toBeVisible();
    await expect(page.getByText("4.5")).toBeVisible();
  });

  test("registra progresso de leitura para um livro em andamento", async ({
    page,
  }) => {
    await setupBookMocks(page, {
      userLibraryStatus: { status: "reading" },
      tracking: { current_page: 50, rating: null, review: null },
    });
    await login(page);
    await page.goto("/livros/book-ext-1/registro");

    await expect(page.getByText("Neuromancer")).toBeVisible();
    await expect(page.getByRole("tab", { name: "Histórico" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await page.getByText("+", { exact: true }).click();
    await page
      .getByText("gostei", { exact: true })
      .locator("..")
      .getByRole("button")
      .click();
    await page.getByText("Salvar registro").click();

    await expect(page.getByText("Registro salvo!")).toBeVisible();
  });

  test("salva uma avaliação para um livro já lido", async ({ page }) => {
    await setupBookMocks(page, {
      userLibraryStatus: { status: "read" },
      tracking: { current_page: 350, rating: null, review: null },
    });
    await login(page);
    await page.goto("/livros/book-ext-1/registro");

    await expect(page.getByRole("tab", { name: "Resenha" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await page.getByLabel("5 estrelas").click();
    await page
      .getByPlaceholder("O que você achou do livro?")
      .fill("Um clássico da ficção científica!");
    await page.getByText("Salvar avaliação").click();

    await expect(page.getByText("Avaliação salva!")).toBeVisible();
  });
});
