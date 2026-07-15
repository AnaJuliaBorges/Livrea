import { supabase } from "@/lib/supabase";
import { searchGoogleBooks } from "@/features/books/api/googleBooks";
import { searchIsbndbByQuery } from "@/features/books/api/isbndb";
import { searchClubReadingBooks } from "./searchClubReadingBooks";
import { setClubReading } from "./setClubReading";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

vi.mock("@/features/books/api/googleBooks", () => ({
  searchGoogleBooks: vi.fn(),
}));

vi.mock("@/features/books/api/isbndb", () => ({
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

  it("retorna resultados do banco sem consultar as APIs externas", async () => {
    rpcMock.mockResolvedValue(rpcResult([dbBook]));

    const results = await searchClubReadingBooks("duna");

    expect(rpcMock).toHaveBeenCalledWith("search_books", {
      p_query: "duna",
      p_limit: 10,
    });
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
    expect(isbndbMock).not.toHaveBeenCalled();
    expect(googleMock).not.toHaveBeenCalled();
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
