import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getBook,
  enrichBookWithGoogle,
  needsGoogleEnrichment,
} from "./getBook";
import { fetchIsbndbBookData } from "./fetchIsbndbBookData";
import { fetchGoogleBookData } from "./fetchGoogleBookData";
import { supabase } from "@/lib/supabase";
import type { Book, BookTemp } from "../types/book";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

vi.mock("./fetchIsbndbBookData", () => ({
  fetchIsbndbBookData: vi.fn(),
}));

vi.mock("./fetchGoogleBookData", () => ({
  fetchGoogleBookData: vi.fn(),
}));

const rpcMock = vi.mocked(supabase.rpc);
const isbndbMock = vi.mocked(fetchIsbndbBookData);
const googleMock = vi.mocked(fetchGoogleBookData);

const completeRow = {
  id: "book-1",
  isbn: "9788528623253",
  title_original: "Anjos Partidos",
  title_pt: null,
  subtitle: null,
  authors: ["Richard Morgan"],
  synopsis: "<p>Sinopse</p>",
  publisher: "Bertrand",
  publisher_date: "2018-04-26",
  total_pages: 490,
  image_small_thumbnail: "small.jpg",
  image_thumbnail: "thumb.jpg",
  image_medium: "medium.jpg",
  image_large: "large.jpg",
  global_average_rating: 4.2,
  global_count_rating: 10,
  local_average_rating: null,
  local_count_rating: null,
  secondary_genre: [],
  subjects: ["Science Fiction"],
  primary_genre: { id: 1, name: "Ficção Científica" },
};

const incompleteRow = {
  ...completeRow,
  synopsis: null,
  image_medium: null,
  image_large: null,
  total_pages: null,
  primary_genre: null,
  subjects: [],
};

const isbndbBook: Book = {
  google_id: "9788528623253",
  info: {
    isbn: "9788528623253",
    title: "Anjos Partidos",
    subtitle: "",
    authors: ["Richard Morgan"],
    summary: "<p>Sinopse da ISBNDB</p>",
    pageCount: 490,
  },
  genre: { secondary: ["Fiction", "Science Fiction"] },
  publisher: { publisher: "Bertrand", publisherDate: "2018-04-26" },
  image: { smallThumbnail: "small.jpg", thumbnail: "thumb.jpg" },
};

function rpcResult(data: unknown, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

beforeEach(() => {
  rpcMock.mockReset();
  isbndbMock.mockReset();
  googleMock.mockReset();
});

describe("getBook", () => {
  it("não enriquece livro já completo", async () => {
    rpcMock.mockResolvedValue(rpcResult(completeRow));

    const book = await getBook("book-1");

    expect(book.title_original).toBe("Anjos Partidos");
    expect(isbndbMock).not.toHaveBeenCalled();
    expect(googleMock).not.toHaveBeenCalled();
  });

  it("completa livro incompleto com os dados da ISBNDB e relê o registro", async () => {
    rpcMock.mockImplementation((async (fn: string) => {
      if (fn === "get_book") {
        return rpcResult(
          rpcMock.mock.calls.filter(([name]) => name === "get_book").length > 1
            ? completeRow
            : incompleteRow,
        );
      }
      return rpcResult(null);
    }) as unknown as typeof supabase.rpc);
    isbndbMock.mockResolvedValue(isbndbBook);

    const book = await getBook("book-1");

    expect(isbndbMock).toHaveBeenCalledWith("9788528623253");
    expect(rpcMock).toHaveBeenCalledWith("complete_book_data", {
      p_book_id: "book-1",
      p_data: expect.objectContaining({
        synopsis: "<p>Sinopse da ISBNDB</p>",
        total_pages: 490,
        categories: ["Fiction", "Science Fiction"],
      }),
    });
    expect(book.synopsis).toBe("<p>Sinopse</p>");
  });

  it("exibe o livro mesmo quando a ISBNDB falha", async () => {
    rpcMock.mockResolvedValue(rpcResult(incompleteRow));
    isbndbMock.mockRejectedValue(new Error("ISBNDB fora do ar"));

    const book = await getBook("book-1");

    expect(book.title_original).toBe("Anjos Partidos");
    expect(
      rpcMock.mock.calls.some(([name]) => name === "complete_book_data"),
    ).toBe(false);
  });
});

describe("needsGoogleEnrichment", () => {
  it("é verdadeiro quando faltam campos que só o Google fornece", () => {
    const book = {
      isbn: "123",
      synopsis: "ok",
      image_medium: undefined,
      total_pages: 100,
      primary_genre: { id: 1, name: "Ficção" },
    } as unknown as BookTemp;

    expect(needsGoogleEnrichment(book)).toBe(true);
  });

  it("é falso quando o livro está completo", () => {
    const book = {
      isbn: "123",
      synopsis: "ok",
      image_medium: "medium.jpg",
      total_pages: 100,
      primary_genre: { id: 1, name: "Ficção" },
    } as unknown as BookTemp;

    expect(needsGoogleEnrichment(book)).toBe(false);
  });
});

describe("enrichBookWithGoogle", () => {
  const bookTemp = {
    id: "book-1",
    isbn: "9788528623253",
  } as unknown as BookTemp;

  it("aplica o patch do Google e retorna true", async () => {
    googleMock.mockResolvedValue({
      ...isbndbBook,
      info: { ...isbndbBook.info, summary: "Sinopse do Google" },
      genre: { main: "Fiction", secondary: ["Science Fiction"] },
      image: { medium: "medium.jpg", large: "large.jpg" },
      averageRating: 4.5,
      ratingsCount: 120,
    });
    rpcMock.mockResolvedValue(rpcResult(null));

    const enriched = await enrichBookWithGoogle(bookTemp);

    expect(enriched).toBe(true);
    expect(rpcMock).toHaveBeenCalledWith("complete_book_data", {
      p_book_id: "book-1",
      p_data: expect.objectContaining({
        average_rating: 4.5,
        image_medium: "medium.jpg",
        categories: ["Fiction", "Science Fiction"],
      }),
    });
  });

  it("retorna false quando o Google falha, sem aplicar patch", async () => {
    googleMock.mockRejectedValue(new Error("503"));

    const enriched = await enrichBookWithGoogle(bookTemp);

    expect(enriched).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });
});
