import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchGoogleBookData, mergeBook } from "./fetchGoogleBookData";
import {
  getGoogleBookById,
  searchGoogleBooksByISBN,
} from "../api/googleBooks";
import type { Book } from "../types/book";
import type { GoogleBooksItem } from "./mapGoogleBook";

vi.mock("../api/googleBooks", () => ({
  getGoogleBookById: vi.fn(),
  searchGoogleBooksByISBN: vi.fn(),
}));

const getByIdMock = vi.mocked(getGoogleBookById);
const searchByIsbnMock = vi.mocked(searchGoogleBooksByISBN);

beforeEach(() => {
  getByIdMock.mockReset();
  searchByIsbnMock.mockReset();
});

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    google_id: "id-1",
    info: { title: "Título", subtitle: "", authors: [] },
    genre: {},
    publisher: { publisherDate: "", publisher: "" },
    image: {},
    ...overrides,
  };
}

describe("mergeBook", () => {
  it("mantém os campos de 'book' quando presentes e usa 'extra' só para lacunas", () => {
    const book = makeBook({
      info: { isbn: undefined, title: "", subtitle: "", authors: [] },
    });
    const extra = makeBook({
      info: {
        isbn: "123",
        title: "Título do extra",
        subtitle: "Sub do extra",
        authors: ["Autor"],
        summary: "Resumo",
        pageCount: 300,
      },
      genre: { main: "Ficção", secondary: ["Fantasia"] },
      publisher: { publisher: "Editora", publisherDate: "2020" },
      image: {
        smallThumbnail: "s.jpg",
        thumbnail: "t.jpg",
        medium: "m.jpg",
        large: "l.jpg",
      },
      averageRating: 4,
      ratingsCount: 10,
    });

    const merged = mergeBook(book, extra);

    expect(merged.info).toEqual({
      isbn: "123",
      title: "Título do extra",
      subtitle: "Sub do extra",
      authors: ["Autor"],
      summary: "Resumo",
      pageCount: 300,
    });
    expect(merged.genre).toEqual({ main: "Ficção", secondary: ["Fantasia"] });
    expect(merged.publisher).toEqual({
      publisher: "Editora",
      publisherDate: "2020",
    });
    expect(merged.averageRating).toBe(4);
    expect(merged.ratingsCount).toBe(10);
  });

  it("prioriza os dados de 'book' quando já preenchidos", () => {
    const book = makeBook({
      info: {
        isbn: "999",
        title: "Título original",
        subtitle: "Sub original",
        authors: ["Autor original"],
        summary: "Resumo original",
        pageCount: 100,
      },
      genre: { main: "Romance", secondary: ["Drama"] },
      publisher: { publisher: "Original", publisherDate: "2010" },
      image: { smallThumbnail: "orig.jpg" },
      averageRating: 5,
      ratingsCount: 20,
    });
    const extra = makeBook({
      info: {
        isbn: "111",
        title: "Outro",
        subtitle: "Outro sub",
        authors: ["Outro autor"],
        summary: "Outro resumo",
        pageCount: 999,
      },
      genre: { main: "Ficção", secondary: ["Fantasia"] },
      publisher: { publisher: "Outra", publisherDate: "2021" },
    });

    const merged = mergeBook(book, extra);

    expect(merged.info.isbn).toBe("999");
    expect(merged.info.title).toBe("Título original");
    expect(merged.genre.main).toBe("Romance");
    expect(merged.publisher.publisher).toBe("Original");
    expect(merged.averageRating).toBe(5);
  });
});

describe("fetchGoogleBookData", () => {
  it("busca por ISBN, mescla com o detalhe do volume e retorna o livro", async () => {
    searchByIsbnMock.mockResolvedValue([
      { id: "vol-1", volumeInfo: { title: "Busca" } } as GoogleBooksItem,
    ]);
    getByIdMock.mockResolvedValue({
      id: "vol-1",
      volumeInfo: { title: "Detalhe", pageCount: 500 },
    } as GoogleBooksItem);

    const result = await fetchGoogleBookData("9788528623253");

    expect(searchByIsbnMock).toHaveBeenCalledWith("9788528623253");
    expect(getByIdMock).toHaveBeenCalledWith("vol-1");
    expect(result?.info.title).toBe("Detalhe");
    expect(result?.info.pageCount).toBe(500);
  });

  it("busca pelo googleId quando não há isbn", async () => {
    getByIdMock.mockResolvedValueOnce({
      id: "vol-2",
      volumeInfo: { title: "Por id" },
    } as GoogleBooksItem);
    getByIdMock.mockResolvedValueOnce(null);

    const result = await fetchGoogleBookData(undefined, "vol-2");

    expect(getByIdMock).toHaveBeenNthCalledWith(1, "vol-2");
    expect(result?.info.title).toBe("Por id");
  });

  it("retorna null quando não há isbn nem googleId", async () => {
    const result = await fetchGoogleBookData();

    expect(result).toBeNull();
    expect(searchByIsbnMock).not.toHaveBeenCalled();
    expect(getByIdMock).not.toHaveBeenCalled();
  });

  it("retorna null quando a busca por isbn não encontra nada", async () => {
    searchByIsbnMock.mockResolvedValue([]);

    const result = await fetchGoogleBookData("000");

    expect(result).toBeNull();
  });

  it("não busca o detalhe quando o item da busca não tem id", async () => {
    searchByIsbnMock.mockResolvedValue([
      { id: "", volumeInfo: { title: "Sem id" } } as GoogleBooksItem,
    ]);

    const result = await fetchGoogleBookData("000");

    expect(getByIdMock).not.toHaveBeenCalled();
    expect(result?.info.title).toBe("Sem id");
  });
});
