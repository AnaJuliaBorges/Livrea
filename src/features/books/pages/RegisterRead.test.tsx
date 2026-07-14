import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RegisterRead from "./RegisterRead";
import { useBook } from "../hooks/useBook";
import {
  useReadingTracking,
  useSaveReadingProgress,
  useSaveHighlight,
  useUpdateHighlight,
  useSaveReview,
} from "../hooks/useReadingTracking";
import { useUserBookStatus } from "../hooks/useUserBookStatus";
import type { BookTemp } from "../types/book";
import type { ReadingTracking } from "../services/readingTracking";

vi.mock("../hooks/useBook");
vi.mock("../hooks/useReadingTracking");
vi.mock("../hooks/useUserBookStatus");

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const useBookMock = vi.mocked(useBook);
const useReadingTrackingMock = vi.mocked(useReadingTracking);
const useUserBookStatusMock = vi.mocked(useUserBookStatus);
const useSaveReadingProgressMock = vi.mocked(useSaveReadingProgress);
const useSaveHighlightMock = vi.mocked(useSaveHighlight);
const useUpdateHighlightMock = vi.mocked(useUpdateHighlight);
const useSaveReviewMock = vi.mocked(useSaveReview);

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

const book: BookTemp = {
  id: "book-1",
  isbn: "123",
  title_original: "Duna",
  title_pt: null,
  subtitle: null,
  authors: ["Frank Herbert"],
  synopsis: null,
  publisher: null,
  publisher_date: null,
  total_pages: 500,
  secondary_genres: [],
};

const tracking: ReadingTracking = {
  currentPage: 100,
  rating: null,
  review: null,
  logs: [],
  highlights: [],
};

function mockAll({
  bookLoading = false,
  bookData = book as BookTemp | undefined,
  trackingLoading = false,
  trackingData = tracking as ReadingTracking | undefined,
  statusLoading = false,
  status = "reading" as string | null,
} = {}) {
  useBookMock.mockReturnValue({
    data: bookData,
    isLoading: bookLoading,
  } as unknown as ReturnType<typeof useBook>);
  useReadingTrackingMock.mockReturnValue({
    data: trackingData,
    isLoading: trackingLoading,
  } as unknown as ReturnType<typeof useReadingTracking>);
  useUserBookStatusMock.mockReturnValue({
    data: status,
    isLoading: statusLoading,
  } as unknown as ReturnType<typeof useUserBookStatus>);
  useSaveReadingProgressMock.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useSaveReadingProgress>);
  useSaveHighlightMock.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useSaveHighlight>);
  useUpdateHighlightMock.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateHighlight>);
  useSaveReviewMock.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useSaveReview>);
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/livros/book-1/registro"]}>
      <Routes>
        <Route path="/livros/:id/registro" element={<RegisterRead />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RegisterRead", () => {
  it("mostra o estado de carregamento", () => {
    mockAll({ bookLoading: true });

    renderPage();

    expect(screen.getByText("Carregando registro...")).toBeInTheDocument();
  });

  it("mostra mensagem de livro não encontrado quando faltam dados", () => {
    mockAll();
    useBookMock.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useBook>);

    renderPage();

    expect(screen.getByText("Livro não encontrado.")).toBeInTheDocument();
  });

  it("mostra título, autores e as abas de navegação", () => {
    mockAll();

    renderPage();

    expect(screen.getByText("Duna")).toBeInTheDocument();
    expect(screen.getByText("Frank Herbert")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Histórico" })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Destaques" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Resenha" })).toBeInTheDocument();
  });

  it("usa title_pt quando disponível", () => {
    mockAll({ bookData: { ...book, title_pt: "Duna (PT)" } });

    renderPage();

    expect(screen.getByText("Duna (PT)")).toBeInTheDocument();
  });

  it("desabilita a aba de resenha quando a leitura não terminou", () => {
    mockAll({ status: "reading", trackingData: { ...tracking, currentPage: 100 } });

    renderPage();

    expect(screen.getByRole("tab", { name: "Resenha" })).toBeDisabled();
  });

  it("habilita a aba de resenha quando o status é 'read'", () => {
    mockAll({ status: "read" });

    renderPage();

    expect(screen.getByRole("tab", { name: "Resenha" })).not.toBeDisabled();
  });

  it("habilita a aba de resenha quando a página atual atingiu o total", () => {
    mockAll({
      status: "reading",
      trackingData: { ...tracking, currentPage: 500 },
    });

    renderPage();

    expect(screen.getByRole("tab", { name: "Resenha" })).not.toBeDisabled();
  });

  it("navega para a aba de destaques ao clicar", async () => {
    const user = userEvent.setup();
    mockAll();

    renderPage();

    await user.click(screen.getByRole("tab", { name: "Destaques" }));

    expect(screen.getByText("Nenhum destaque ainda.")).toBeInTheDocument();
  });

  it("volta para a página anterior ao clicar no cabeçalho", async () => {
    const user = userEvent.setup();
    mockAll();

    renderPage();

    await user.click(screen.getByText("Registro de leitura"));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
