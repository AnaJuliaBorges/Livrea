import { supabase } from "@/lib/supabase";
import {
  completeClubReading,
  deleteClubReading,
  getClubBookHighlights,
  getClubBookRating,
  getClubBookReviews,
  getClubReadingReaders,
  setClubReading,
  setClubReadingNote,
} from "./clubReadings";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown = null, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

describe("setClubReading", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC set_club_reading com o clube e o livro", async () => {
    rpcMock.mockResolvedValue(rpcResult());

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

describe("completeClubReading", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC complete_club_reading com o id do clube", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await completeClubReading("club-1");

    expect(rpcMock).toHaveBeenCalledWith("complete_club_reading", {
      p_club_id: "club-1",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(
      rpcResult(null, new Error("O clube não tem uma leitura atual")),
    );

    await expect(completeClubReading("club-1")).rejects.toThrow(
      "O clube não tem uma leitura atual",
    );
  });
});

describe("deleteClubReading", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC delete_club_reading com o id do clube", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await deleteClubReading("club-1");

    expect(rpcMock).toHaveBeenCalledWith("delete_club_reading", {
      p_club_id: "club-1",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(
      rpcResult(null, new Error("O clube não tem uma leitura atual")),
    );

    await expect(deleteClubReading("club-1")).rejects.toThrow(
      "O clube não tem uma leitura atual",
    );
  });
});

describe("setClubReadingNote", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC set_club_reading_note com a leitura e o texto", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await setClubReadingNote("reading-1", "Melhor livro do semestre.");

    expect(rpcMock).toHaveBeenCalledWith("set_club_reading_note", {
      p_reading_id: "reading-1",
      p_note: "Melhor livro do semestre.",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(
      rpcResult(null, new Error("apenas administradores")),
    );

    await expect(setClubReadingNote("reading-1", "x")).rejects.toThrow(
      "apenas administradores",
    );
  });
});

describe("getClubReadingReaders", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_club_reading_readers e mapeia o retorno", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        {
          user_id: "user-1",
          name: "Ana Júlia",
          avatar_url: "https://cdn/avatar.png",
          is_admin: true,
          progress: 78,
          started: true,
          rating: null,
        },
        {
          user_id: "user-2",
          name: "Bruna",
          avatar_url: null,
          is_admin: false,
          progress: 100,
          started: true,
          rating: 4,
        },
      ]),
    );

    const readers = await getClubReadingReaders("club-1", "book-1");

    expect(rpcMock).toHaveBeenCalledWith("get_club_reading_readers", {
      p_club_id: "club-1",
      p_book_id: "book-1",
    });
    expect(readers).toEqual([
      {
        userId: "user-1",
        name: "Ana Júlia",
        avatarUrl: "https://cdn/avatar.png",
        isAdmin: true,
        progress: 78,
        started: true,
        rating: null,
      },
      {
        userId: "user-2",
        name: "Bruna",
        avatarUrl: null,
        isAdmin: false,
        progress: 100,
        started: true,
        rating: 4,
      },
    ]);
  });

  it("retorna lista vazia quando não há dados", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    expect(await getClubReadingReaders("club-1", "book-1")).toEqual([]);
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getClubReadingReaders("club-1", "book-1")).rejects.toThrow(
      "boom",
    );
  });
});

describe("getClubBookRating", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_club_book_rating e mapeia o retorno", async () => {
    rpcMock.mockResolvedValue(
      rpcResult({ club_average: 4.2, club_count: 5, my_rating: 5 }),
    );

    const rating = await getClubBookRating("club-1", "book-1");

    expect(rpcMock).toHaveBeenCalledWith("get_club_book_rating", {
      p_club_id: "club-1",
      p_book_id: "book-1",
    });
    expect(rating).toEqual({
      clubAverage: 4.2,
      clubCount: 5,
      myRating: 5,
    });
  });

  it("normaliza médias/nota ausentes (null) e contagem faltante", async () => {
    rpcMock.mockResolvedValue(
      rpcResult({ club_average: null, club_count: 0, my_rating: null }),
    );

    const rating = await getClubBookRating("club-1", "book-1");

    expect(rating).toEqual({
      clubAverage: null,
      clubCount: 0,
      myRating: null,
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getClubBookRating("club-1", "book-1")).rejects.toThrow("boom");
  });
});

describe("getClubBookReviews", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_club_book_reviews e mapeia o retorno", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        {
          user_id: "user-1",
          name: "Ana Júlia",
          avatar_url: "https://cdn/avatar.png",
          rating: 5,
          review: "Livro incrível, li em dois dias.",
        },
        {
          user_id: "user-2",
          name: "Bruna",
          avatar_url: null,
          rating: null,
          review: "Gostei, mas o final é corrido.",
        },
      ]),
    );

    const reviews = await getClubBookReviews("club-1", "book-1");

    expect(rpcMock).toHaveBeenCalledWith("get_club_book_reviews", {
      p_club_id: "club-1",
      p_book_id: "book-1",
    });
    expect(reviews).toEqual([
      {
        userId: "user-1",
        name: "Ana Júlia",
        avatarUrl: "https://cdn/avatar.png",
        rating: 5,
        review: "Livro incrível, li em dois dias.",
      },
      {
        userId: "user-2",
        name: "Bruna",
        avatarUrl: null,
        rating: null,
        review: "Gostei, mas o final é corrido.",
      },
    ]);
  });

  it("retorna lista vazia quando não há dados", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    expect(await getClubBookReviews("club-1", "book-1")).toEqual([]);
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getClubBookReviews("club-1", "book-1")).rejects.toThrow(
      "boom",
    );
  });
});

describe("getClubBookHighlights", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_club_book_highlights e mapeia o retorno", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        {
          user_id: "user-1",
          name: "Ana Júlia",
          avatar_url: "https://cdn/avatar.png",
          page: 42,
          quote: "O amor é a ponte.",
        },
      ]),
    );

    const highlights = await getClubBookHighlights("club-1", "book-1");

    expect(rpcMock).toHaveBeenCalledWith("get_club_book_highlights", {
      p_club_id: "club-1",
      p_book_id: "book-1",
    });
    expect(highlights).toEqual([
      {
        userId: "user-1",
        name: "Ana Júlia",
        avatarUrl: "https://cdn/avatar.png",
        page: 42,
        quote: "O amor é a ponte.",
      },
    ]);
  });

  it("retorna lista vazia quando não há dados", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    expect(await getClubBookHighlights("club-1", "book-1")).toEqual([]);
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getClubBookHighlights("club-1", "book-1")).rejects.toThrow(
      "boom",
    );
  });
});
