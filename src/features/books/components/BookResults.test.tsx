import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BookResults } from "./BookResults";
import type { Book } from "../types/book";

function makeBook(id: string, title: string): Book {
  return {
    google_id: id,
    info: { title, subtitle: "", authors: [] },
    genre: {},
    publisher: { publisher: "", publisherDate: "" },
    image: {},
  };
}

let observeMock: ReturnType<typeof vi.fn>;
let disconnectMock: ReturnType<typeof vi.fn>;
let observerCallback: IntersectionObserverCallback;

beforeEach(() => {
  observeMock = vi.fn();
  disconnectMock = vi.fn();
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(function (callback: IntersectionObserverCallback) {
      observerCallback = callback;
      return {
        observe: observeMock,
        disconnect: disconnectMock,
        unobserve: vi.fn(),
      };
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("BookResults", () => {
  it("mostra mensagem de carregamento quando não há livros ainda", () => {
    render(
      <BookResults
        books={[]}
        selectedIds={new Set()}
        onToggle={vi.fn()}
        isLoading
      />,
    );

    expect(screen.getByText("Procurando livros...")).toBeInTheDocument();
  });

  it("mostra mensagem de vazio quando a busca não encontrou nada", () => {
    render(
      <BookResults
        books={[]}
        selectedIds={new Set()}
        onToggle={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Nenhum livro encontrado")).toBeInTheDocument();
  });

  it("renderiza os livros e marca os selecionados", () => {
    const books = [makeBook("1", "Duna"), makeBook("2", "Neuromancer")];

    render(
      <BookResults
        books={books}
        selectedIds={new Set(["2"])}
        onToggle={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Duna")).toBeInTheDocument();
    expect(screen.getByText("Neuromancer")).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("chama onToggle com o livro clicado", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const books = [makeBook("1", "Duna")];

    render(
      <BookResults
        books={books}
        selectedIds={new Set()}
        onToggle={onToggle}
        isLoading={false}
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(onToggle).toHaveBeenCalledWith(books[0]);
  });

  it("observa o marcador final e chama onLoadMore quando ele entra em vista", () => {
    const onLoadMore = vi.fn();
    const books = [makeBook("1", "Duna")];

    render(
      <BookResults
        books={books}
        selectedIds={new Set()}
        onToggle={vi.fn()}
        isLoading={false}
        hasNextPage
        onLoadMore={onLoadMore}
      />,
    );

    expect(observeMock).toHaveBeenCalled();

    observerCallback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(onLoadMore).toHaveBeenCalled();
  });

  it("mostra mensagem de carregando mais quando isFetchingNextPage", () => {
    const books = [makeBook("1", "Duna")];

    render(
      <BookResults
        books={books}
        selectedIds={new Set()}
        onToggle={vi.fn()}
        isLoading={false}
        hasNextPage
        isFetchingNextPage
      />,
    );

    expect(screen.getByText("Carregando mais livros...")).toBeInTheDocument();
  });

  it("não observa quando não há próxima página", () => {
    const books = [makeBook("1", "Duna")];

    render(
      <BookResults
        books={books}
        selectedIds={new Set()}
        onToggle={vi.fn()}
        isLoading={false}
      />,
    );

    expect(observeMock).not.toHaveBeenCalled();
  });
});
