import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { BookDetail } from "./BookDetail";
import { useBook } from "../hooks/useBook";
import { useBookReviews } from "../hooks/useBookReviews";
import { useReadingTracking } from "../hooks/useReadingTracking";
import {
  useSetUserBookStatus,
  useUserBookStatus,
} from "../hooks/useUserBookStatus";
import type { BookTemp, BookReview } from "../types/book";
import type { ReadingTracking } from "../services/readingTracking";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../hooks/useBook");
vi.mock("../hooks/useBookReviews");
vi.mock("../hooks/useReadingTracking");
vi.mock("../hooks/useUserBookStatus");

const useBookMock = vi.mocked(useBook);
const useBookReviewsMock = vi.mocked(useBookReviews);
const useReadingTrackingMock = vi.mocked(useReadingTracking);
const useUserBookStatusMock = vi.mocked(useUserBookStatus);
const useSetUserBookStatusMock = vi.mocked(useSetUserBookStatus);

const saveStatusMock = vi.fn();

const book: BookTemp = {
  id: "book-1",
  isbn: "123",
  title_original: "Duna",
  title_pt: null,
  subtitle: null,
  authors: ["Frank Herbert"],
  synopsis: "<p>Sinopse do livro</p>",
  publisher: "Aleph",
  publisher_date: "2017-08-01",
  total_pages: 500,
  secondary_genres: [],
  primary_genre: { id: 1, name: "Ficção Científica" },
  global_average_rating: 4.7,
};

function mockAll({
  bookState = { data: book, isLoading: false, isError: false },
  status = null as string | null,
  tracking = null as ReadingTracking | null,
  reviews = [] as BookReview[],
}: {
  bookState?: { data?: BookTemp; isLoading?: boolean; isError?: boolean };
  status?: string | null;
  tracking?: ReadingTracking | null;
  reviews?: BookReview[];
} = {}) {
  useBookMock.mockReturnValue({
    data: bookState.data,
    isLoading: bookState.isLoading ?? false,
    isError: bookState.isError ?? false,
  } as unknown as ReturnType<typeof useBook>);
  useUserBookStatusMock.mockReturnValue({
    data: status,
  } as unknown as ReturnType<typeof useUserBookStatus>);
  useSetUserBookStatusMock.mockReturnValue({
    mutate: saveStatusMock,
  } as unknown as ReturnType<typeof useSetUserBookStatus>);
  useReadingTrackingMock.mockReturnValue({
    data: tracking,
  } as unknown as ReturnType<typeof useReadingTracking>);
  useBookReviewsMock.mockReturnValue({
    data: reviews,
  } as unknown as ReturnType<typeof useBookReviews>);
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/livros/book-1"]}>
      <Routes>
        <Route path="/livros/:id" element={<BookDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("BookDetail", () => {
  it("mostra o estado de carregamento", () => {
    mockAll({ bookState: { isLoading: true } });

    renderPage();

    expect(screen.getByText("Carregando livro...")).toBeInTheDocument();
  });

  it("mostra mensagem quando o livro não é encontrado", () => {
    mockAll({ bookState: { isError: true } });

    renderPage();

    expect(screen.getByText("Livro não encontrado.")).toBeInTheDocument();
  });

  it("mostra título, autores e nota do livro", () => {
    mockAll();

    renderPage();

    expect(screen.getByText("Duna")).toBeInTheDocument();
    expect(screen.getByText("Frank Herbert")).toBeInTheDocument();
    expect(screen.getByText("4.7")).toBeInTheDocument();
  });

  it("usa title_pt quando disponível", () => {
    mockAll({ bookState: { data: { ...book, title_pt: "Duna (PT)" } } });

    renderPage();

    expect(screen.getByText("Duna (PT)")).toBeInTheDocument();
  });

  it("mostra 0.0 quando o livro não tem nota", () => {
    mockAll({
      bookState: {
        data: { ...book, global_average_rating: undefined },
      },
    });

    renderPage();

    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("prioriza a média local sobre a global quando houver as duas", () => {
    mockAll({
      bookState: {
        data: { ...book, local_average_rating: 3.2, global_average_rating: 4.7 },
      },
    });

    renderPage();

    expect(screen.getByText("3.2")).toBeInTheDocument();
    expect(screen.queryByText("4.7")).not.toBeInTheDocument();
  });

  it("mostra a sinopse, editora, ano e páginas", () => {
    mockAll();

    renderPage();

    expect(screen.getByText("Sinopse do livro")).toBeInTheDocument();
    expect(screen.getByText("Aleph")).toBeInTheDocument();
    expect(screen.getByText("2017")).toBeInTheDocument();
    expect(screen.getByText("500 páginas")).toBeInTheDocument();
    expect(screen.getByText("Ficção Científica")).toBeInTheDocument();
  });

  it("mostra o progresso de leitura quando o status é 'reading'", () => {
    mockAll({
      status: "reading",
      tracking: {
        currentPage: 250,
        rating: null,
        review: null,
        logs: [],
        highlights: [],
      },
    });

    renderPage();

    expect(screen.getByText("Sua leitura")).toBeInTheDocument();
    expect(screen.getByText("Registro de leitura")).toBeInTheDocument();
  });

  it("mostra o período de leitura quando o status é 'read' e há logs", () => {
    mockAll({
      status: "read",
      tracking: {
        currentPage: 500,
        rating: 5,
        review: "Ótimo",
        logs: [
          {
            id: "log-2",
            pages_read: 500,
            feeling: "amei",
            note: null,
            created_at: "2026-02-01T00:00:00",
          },
          {
            id: "log-1",
            pages_read: 100,
            feeling: "gostei",
            note: null,
            created_at: "2026-01-01T00:00:00",
          },
        ],
        highlights: [],
      },
    });

    renderPage();

    expect(screen.getByText(/Lido de/)).toBeInTheDocument();
    expect(screen.getByText("5.0")).toBeInTheDocument();
  });

  it("mostra mensagem de nenhuma avaliação quando não há reviews", () => {
    mockAll({ reviews: [] });

    renderPage();

    expect(screen.getByText("Nenhuma avaliação ainda")).toBeInTheDocument();
  });

  it("lista as avaliações do livro", () => {
    mockAll({
      reviews: [
        {
          id: "1",
          user: { id: "1", name: "Ana", photo: "" },
          created_at: "2026-01-01T00:00:00",
          rating: 5,
          comment: "Excelente!",
          likes: 0,
        },
      ],
    });

    renderPage();

    expect(screen.getByText("Excelente!")).toBeInTheDocument();
  });

  it("mostra erro quando salvar o status do livro falha", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    mockAll();
    saveStatusMock.mockImplementation((_value, options) => {
      options?.onError?.();
    });
    Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
    Element.prototype.scrollIntoView = vi.fn();

    renderPage();

    await user.click(screen.getByText("Adicionar livro"));
    await user.click(await screen.findByText("Lido"));

    expect(saveStatusMock).toHaveBeenCalledWith(
      "read",
      expect.objectContaining({ onError: expect.any(Function) }),
    );
    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível salvar o status. Tente novamente.",
    );
  });

  it("mostra a opção de remover da biblioteca quando o livro já tem status", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    mockAll({ status: "want_to_read" });
    Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
    Element.prototype.scrollIntoView = vi.fn();

    renderPage();

    await user.click(screen.getByRole("combobox"));

    expect(
      await screen.findByText("Remover da biblioteca"),
    ).toBeInTheDocument();
  });
});
