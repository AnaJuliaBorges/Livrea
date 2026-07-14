import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveUserBooks, toBookPayload } from "./saveUserBooks";
import { fetchGoogleBookData } from "./fetchGoogleBookData";
import { supabase } from "@/lib/supabase";
import type { Book } from "../types/book";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

vi.mock("./fetchGoogleBookData", () => ({
  fetchGoogleBookData: vi.fn(),
  mergeBook: (book: Book, extra: Book) => ({
    ...book,
    info: { ...extra.info, ...book.info },
  }),
}));

const rpcMock = vi.mocked(supabase.rpc);
const googleMock = vi.mocked(fetchGoogleBookData);

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    google_id: "id-1",
    info: { isbn: "123", title: "Título", subtitle: "", authors: ["Autor"] },
    genre: { main: "Ficção", secondary: ["Fantasia"] },
    publisher: { publisher: "Editora", publisherDate: "2020" },
    image: { smallThumbnail: "s.jpg", thumbnail: "t.jpg" },
    averageRating: 4.5,
    ratingsCount: 10,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  googleMock.mockResolvedValue(null);
  rpcMock.mockResolvedValue({ data: null, error: null } as unknown as Awaited<
    ReturnType<typeof supabase.rpc>
  >);
});

describe("toBookPayload", () => {
  it("converte um Book para o payload da RPC save_user_books", () => {
    const book = makeBook({
      info: {
        isbn: "123",
        title: "Título",
        subtitle: "",
        authors: ["Autor"],
        summary: "Resumo",
        pageCount: 300,
      },
    });

    expect(toBookPayload(book)).toEqual({
      isbn: "123",
      title: "Título",
      subtitle: "",
      authors: ["Autor"],
      synopsis: "Resumo",
      publisher: "Editora",
      publisher_date: "2020",
      total_pages: 300,
      image_small_thumbnail: "s.jpg",
      image_thumbnail: "t.jpg",
      image_medium: null,
      image_large: null,
      categories: ["Ficção", "Fantasia"],
      average_rating: 4.5,
      ratings_count: 10,
    });
  });

  it("usa null/0 para campos ausentes", () => {
    const book = makeBook({
      info: { isbn: "123", title: "Título", subtitle: "", authors: [] },
      genre: {},
      averageRating: undefined,
      ratingsCount: undefined,
    });

    const payload = toBookPayload(book);

    expect(payload.synopsis).toBeNull();
    expect(payload.total_pages).toBe(0);
    expect(payload.categories).toEqual([]);
    expect(payload.average_rating).toBeNull();
    expect(payload.ratings_count).toBeNull();
  });
});

describe("saveUserBooks", () => {
  it("não chama a RPC quando não há livros com ISBN", async () => {
    const book = makeBook({
      info: { isbn: undefined, title: "Sem isbn", subtitle: "", authors: [] },
    });

    await saveUserBooks([book], "read");

    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("filtra livros sem isbn e envia os demais para a RPC", async () => {
    const withIsbn = makeBook();
    const withoutIsbn = makeBook({
      google_id: "id-2",
      info: { isbn: undefined, title: "Sem isbn", subtitle: "", authors: [] },
    });

    await saveUserBooks([withIsbn, withoutIsbn], "want_to_read");

    expect(rpcMock).toHaveBeenCalledWith("save_user_books", {
      p_books: [toBookPayload(withIsbn)],
      p_status: "want_to_read",
    });
  });

  it("enriquece os livros com dados do Google antes de salvar", async () => {
    const book = makeBook({
      info: { isbn: "123", title: "Título", subtitle: "", authors: [] },
    });
    googleMock.mockResolvedValue(
      makeBook({ info: { isbn: "123", title: "Do Google", subtitle: "", authors: [] } }),
    );

    await saveUserBooks([book], "read");

    const call = rpcMock.mock.calls[0][1] as { p_books: { title: string }[] };
    expect(call.p_books[0].title).toBe("Título");
  });

  it("ignora falha do enriquecimento e salva o livro original", async () => {
    const book = makeBook();
    googleMock.mockRejectedValue(new Error("Google indisponível"));

    await saveUserBooks([book], "read");

    expect(rpcMock).toHaveBeenCalled();
  });

  it("processa livros em lotes de 5", async () => {
    const books = Array.from({ length: 7 }, (_, i) =>
      makeBook({ google_id: `id-${i}`, info: { isbn: `${i}`, title: `Livro ${i}`, subtitle: "", authors: [] } }),
    );

    await saveUserBooks(books, "read");

    expect(googleMock).toHaveBeenCalledTimes(7);
    const call = rpcMock.mock.calls[0][1] as { p_books: unknown[] };
    expect(call.p_books).toHaveLength(7);
  });

  it("lança o erro retornado pela RPC", async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: new Error("falha ao salvar"),
    } as unknown as Awaited<ReturnType<typeof supabase.rpc>>);

    await expect(saveUserBooks([makeBook()], "read")).rejects.toThrow(
      "falha ao salvar",
    );
  });
});
