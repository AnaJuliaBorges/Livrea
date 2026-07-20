import { supabase } from "@/lib/supabase";
import { searchGoogleBooks, searchIsbndbByQuery } from "@/features/books";
import { searchClubReadingBooks } from "./searchClubReadingBooks";
import { setClubReading } from "./setClubReading";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

// o service importa do barrel da feature books: mocka só as buscas
// externas e mantém o resto real (os mappers precisam funcionar de verdade)
vi.mock("@/features/books", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/books")>()),
  searchGoogleBooks: vi.fn(),
  searchIsbndbByQuery: vi.fn(),
}));

const rpcMock = vi.mocked(supabase.rpc);
const isbndbMock = vi.mocked(searchIsbndbByQuery);
const googleMock = vi.mocked(searchGoogleBooks);

function rpcResult(data: unknown, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

const dbBook = {
  id: "book-1",
  title: "Duna",
  authors: ["Frank Herbert"],
  image_thumbnail: "thumb.png",
};

const isbndbBook = {
  isbn13: "9788544106051",
  title: "Duna",
  authors: ["Frank Herbert"],
  image: "https://images.isbndb.com/covers/duna.jpg",
};

const isbndbBookOtherEdition = {
  isbn13: "9788599296355",
  title: "Duna Messias",
  authors: ["Frank Herbert"],
  image: "https://images.isbndb.com/covers/duna-messias.jpg",
};

const googleItem = {
  id: "vol-1",
  volumeInfo: {
    title: "Duna",
    authors: ["Frank Herbert"],
    industryIdentifiers: [{ type: "ISBN_13", identifier: "9788544106051" }],
    imageLinks: { thumbnail: "google-thumb.png" },
  },
};

describe("searchClubReadingBooks", () => {
  beforeEach(() => {
    rpcMock.mockReset();
    isbndbMock.mockReset();
    googleMock.mockReset();
  });

  it("combina resultados do banco e da ISBNDB sem consultar o Google", async () => {
    rpcMock.mockResolvedValue(rpcResult([dbBook]));
    isbndbMock.mockResolvedValue([isbndbBookOtherEdition] as never);

    const results = await searchClubReadingBooks("duna");

    expect(rpcMock).toHaveBeenCalledWith("search_books", {
      p_query: "duna",
      p_limit: 10,
    });
    expect(isbndbMock).toHaveBeenCalledWith("duna", 10, 1);
    expect(results).toEqual([
      {
        key: "db-book-1",
        title: "Duna",
        authors: ["Frank Herbert"],
        thumbnail: "thumb.png",
        source: "db",
        bookId: "book-1",
      },
      expect.objectContaining({
        key: "ext-9788599296355",
        source: "external",
      }),
    ]);
    expect(googleMock).not.toHaveBeenCalled();
  });

  it("não duplica o mesmo livro quando aparece no banco e na ISBNDB, priorizando o banco", async () => {
    rpcMock.mockResolvedValue(rpcResult([dbBook]));
    isbndbMock.mockResolvedValue([isbndbBook] as never);

    const results = await searchClubReadingBooks("duna");

    expect(results).toEqual([
      {
        key: "db-book-1",
        title: "Duna",
        authors: ["Frank Herbert"],
        thumbnail: "thumb.png",
        source: "db",
        bookId: "book-1",
      },
    ]);
  });

  it("ignora acento e caixa ao comparar título/autor entre banco e ISBNDB", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([{ ...dbBook, title: "DUNA", authors: ["frank herbert"] }]),
    );
    isbndbMock.mockResolvedValue([isbndbBook] as never);

    const results = await searchClubReadingBooks("duna");

    expect(results).toHaveLength(1);
    expect(results[0].source).toBe("db");
  });

  it("cai para a ISBNDB quando o banco não tem resultados", async () => {
    rpcMock.mockResolvedValue(rpcResult([]));
    isbndbMock.mockResolvedValue([isbndbBook] as never);

    const results = await searchClubReadingBooks("duna");

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      source: "external",
      title: "Duna",
    });
    expect(results[0].externalBook?.info.isbn).toBe("9788544106051");
    expect(googleMock).not.toHaveBeenCalled();
  });

  it("segue com o resultado do banco quando a ISBNDB falha", async () => {
    rpcMock.mockResolvedValue(rpcResult([dbBook]));
    isbndbMock.mockRejectedValue(new Error("timeout"));

    const results = await searchClubReadingBooks("duna");

    expect(results).toEqual([
      {
        key: "db-book-1",
        title: "Duna",
        authors: ["Frank Herbert"],
        thumbnail: "thumb.png",
        source: "db",
        bookId: "book-1",
      },
    ]);
    expect(googleMock).not.toHaveBeenCalled();
  });

  it("cai para o Google quando banco e ISBNDB não retornam nada", async () => {
    rpcMock.mockResolvedValue(rpcResult([]));
    isbndbMock.mockResolvedValue([] as never);
    googleMock.mockResolvedValue([googleItem]);

    const results = await searchClubReadingBooks("duna");

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      source: "external",
      key: "ext-9788544106051",
    });
  });

  it("descarta livros externos sem ISBN (não podem ser salvos)", async () => {
    rpcMock.mockResolvedValue(rpcResult([]));
    isbndbMock.mockResolvedValue([] as never);
    googleMock.mockResolvedValue([
      { ...googleItem, volumeInfo: { ...googleItem.volumeInfo, industryIdentifiers: [] } },
    ]);

    const results = await searchClubReadingBooks("duna");

    expect(results).toEqual([]);
  });
});

describe("setClubReading", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC set_club_reading", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    await setClubReading("club-1", "book-1");

    expect(rpcMock).toHaveBeenCalledWith("set_club_reading", {
      p_club_id: "club-1",
      p_book_id: "book-1",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("não é admin")));

    await expect(setClubReading("club-1", "book-1")).rejects.toThrow(
      "não é admin",
    );
  });
});
