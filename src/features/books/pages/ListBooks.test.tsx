import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import ListBooks from "./ListBooks";
import { useUpsertBook } from "../hooks/useUpsertBook";
import { useProfileGenreIds } from "@/features/profile";
import { useGenres } from "../hooks/useGenres";
import { useBooksByGenres } from "../hooks/useBooksByGenres";
import { useSearchBooks } from "../hooks/useSearchBooks";
import type { GenreBook } from "../services/getBooksByGenres";
import type { Book } from "../types/book";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../hooks/useUpsertBook");
vi.mock("@/features/profile");
vi.mock("../hooks/useGenres");
vi.mock("../hooks/useBooksByGenres");
vi.mock("../hooks/useSearchBooks");

const useUpsertBookMock = vi.mocked(useUpsertBook);
const useProfileGenreIdsMock = vi.mocked(useProfileGenreIds);
const useGenresMock = vi.mocked(useGenres);
const useBooksByGenresMock = vi.mocked(useBooksByGenres);
const useSearchBooksMock = vi.mocked(useSearchBooks);

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

const upsertMutateMock = vi.fn();

function makeExternalBook(overrides: Partial<Book> = {}): Book {
  return {
    google_id: "ext-1",
    info: { title: "Livro Externo", subtitle: "", authors: [], isbn: "999" },
    genre: {},
    publisher: { publisher: "", publisherDate: "" },
    image: {},
    ...overrides,
  };
}

function mockDefaults({
  genreIds = [1],
  genreIdsLoading = false,
  genreIdsError = false,
  genresLoading = false,
  dbBooks = [] as GenreBook[],
  dbBooksLoading = false,
  externalBooks = [] as Book[],
  externalLoading = false,
  externalError = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  isOpeningBook = false,
} = {}) {
  useProfileGenreIdsMock.mockReturnValue({
    data: genreIds,
    isLoading: genreIdsLoading,
    isError: genreIdsError,
  } as unknown as ReturnType<typeof useProfileGenreIds>);
  useGenresMock.mockReturnValue({
    data: [{ id: 1, name: "Fantasia", google_category: ["Fiction/Fantasy"] }],
    isLoading: genresLoading,
  } as unknown as ReturnType<typeof useGenres>);
  useBooksByGenresMock.mockReturnValue({
    data: dbBooks,
    isLoading: dbBooksLoading,
  } as unknown as ReturnType<typeof useBooksByGenres>);
  useSearchBooksMock.mockReturnValue({
    data: externalBooks,
    isLoading: externalLoading,
    isError: externalError,
    hasNextPage,
    fetchNextPage: vi.fn(),
    isFetchingNextPage,
  } as unknown as ReturnType<typeof useSearchBooks>);
  useUpsertBookMock.mockReturnValue({
    mutateAsync: upsertMutateMock,
    isPending: isOpeningBook,
  } as unknown as ReturnType<typeof useUpsertBook>);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ListBooks />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ListBooks", () => {
  it("mostra aviso quando o usuário não tem gêneros favoritos", () => {
    mockDefaults({ genreIds: [] });

    renderPage();

    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === "P" &&
          (element?.textContent ?? "").includes(
            "Você ainda não tem gêneros favoritos.",
          ),
      ),
    ).toBeInTheDocument();
  });

  it("mostra estado de carregando quando ainda não há livros", () => {
    mockDefaults({ externalLoading: true, dbBooksLoading: true });

    renderPage();

    expect(screen.getByText("Procurando livros...")).toBeInTheDocument();
  });

  it("mostra mensagem de vazio quando não há recomendações nem livros salvos", () => {
    mockDefaults();

    renderPage();

    expect(screen.getByText("Nenhum livro encontrado")).toBeInTheDocument();
  });

  it("diferencia falha da busca de ausência de resultados", () => {
    mockDefaults({ externalError: true });

    renderPage();

    expect(
      screen.getByText(
        "Não foi possível buscar os livros agora. Tente de novo em instantes.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Nenhum livro encontrado"),
    ).not.toBeInTheDocument();
  });

  it("não diz que faltam gêneros quando a consulta de gêneros falhou", () => {
    mockDefaults({ genreIds: [], genreIdsError: true });

    renderPage();

    expect(
      screen.queryByText(/Você ainda não tem gêneros favoritos/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Não foi possível buscar os livros agora. Tente de novo em instantes.",
      ),
    ).toBeInTheDocument();
  });

  it("lista os livros recomendados do banco", () => {
    mockDefaults({
      dbBooks: [{ id: "1", isbn: "123", title: "Livro do banco" }],
    });

    renderPage();

    expect(screen.getByText("Recomendados para você")).toBeInTheDocument();
    expect(screen.getByText("Livro do banco")).toBeInTheDocument();
  });

  it("lista os livros externos que ainda não estão no banco", () => {
    mockDefaults({ externalBooks: [makeExternalBook()] });

    renderPage();

    expect(screen.getByText("Livro Externo")).toBeInTheDocument();
  });

  it("abre um livro externo ao clicar, criando o registro no banco", async () => {
    const user = userEvent.setup();
    upsertMutateMock.mockResolvedValue("book-novo");
    mockDefaults({ externalBooks: [makeExternalBook()] });

    renderPage();

    await user.click(screen.getByText("Livro Externo"));

    expect(upsertMutateMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/livros/book-novo");
  });

  it("mostra erro quando não consegue abrir o livro externo", async () => {
    const user = userEvent.setup();
    upsertMutateMock.mockRejectedValue(new Error("falhou"));
    mockDefaults({ externalBooks: [makeExternalBook()] });

    renderPage();

    await user.click(screen.getByText("Livro Externo"));

    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível abrir o livro. Tente novamente.",
    );
  });

  it("busca por texto ao digitar no campo de busca", async () => {
    const user = userEvent.setup();
    mockDefaults();

    renderPage();

    await user.type(
      screen.getByPlaceholderText("Buscar livros"),
      "duna",
    );

    expect(screen.getByPlaceholderText("Buscar livros")).toHaveValue("duna");
  });

  it("mostra 'Resultados da busca' e o indicador de mais páginas durante uma busca", () => {
    mockDefaults({
      externalBooks: [makeExternalBook()],
      hasNextPage: true,
      isFetchingNextPage: true,
    });

    renderPage();

    expect(screen.getByText("Livro Externo")).toBeInTheDocument();
    expect(
      screen.getByText("Carregando mais livros..."),
    ).toBeInTheDocument();
  });

  it("não duplica na lista externa livros que já existem no banco", () => {
    mockDefaults({
      dbBooks: [{ id: "1", isbn: "999", title: "Já no banco" }],
      externalBooks: [makeExternalBook({ info: { title: "Livro Externo", subtitle: "", authors: [], isbn: "999" } })],
    });

    renderPage();

    expect(screen.getByText("Já no banco")).toBeInTheDocument();
    expect(screen.queryByText("Livro Externo")).not.toBeInTheDocument();
  });
});
