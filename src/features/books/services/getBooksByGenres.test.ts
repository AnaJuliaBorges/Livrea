import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBooksByGenres } from "./getBooksByGenres";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

// a cascata (junção book_genres → primary_genre_id → todos os livros) vive
// na RPC get_books_by_genres, no SQL; aqui o service só repassa os ids e
// mapeia as linhas cruas que a RPC devolve
function rpcResult(data: unknown, error: unknown = null) {
  return { data, error } as unknown as Awaited<
    ReturnType<typeof supabase.rpc>
  >;
}

beforeEach(() => {
  vi.clearAllMocks();
});

const row = {
  id: "book-1",
  isbn: "123",
  title_original: "Título original",
  title_pt: "Título traduzido",
  image_thumbnail: "thumb.jpg",
  image_medium: "medium.jpg",
};

describe("getBooksByGenres", () => {
  it("retorna array vazio quando não há ids de gênero", async () => {
    const result = await getBooksByGenres([]);

    expect(result).toEqual([]);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("chama a RPC get_books_by_genres passando os ids", async () => {
    rpcMock.mockResolvedValueOnce(rpcResult([row]));

    await getBooksByGenres([1, 2]);

    expect(rpcMock).toHaveBeenCalledWith("get_books_by_genres", {
      p_genre_ids: [1, 2],
    });
  });

  it("mapeia os livros retornados pela RPC", async () => {
    rpcMock.mockResolvedValueOnce(rpcResult([row]));

    const result = await getBooksByGenres([1, 2]);

    expect(result).toEqual([
      {
        id: "book-1",
        isbn: "123",
        title: "Título traduzido",
        image: "thumb.jpg",
      },
    ]);
  });

  it("usa title_original quando não há title_pt", async () => {
    rpcMock.mockResolvedValueOnce(rpcResult([{ ...row, title_pt: null }]));

    const result = await getBooksByGenres([1]);

    expect(result[0].title).toBe("Título original");
  });

  it("usa image_medium quando não há image_thumbnail", async () => {
    rpcMock.mockResolvedValueOnce(
      rpcResult([{ ...row, image_thumbnail: null }]),
    );

    const result = await getBooksByGenres([1]);

    expect(result[0].image).toBe("medium.jpg");
  });

  it("deixa image undefined quando não há nenhuma imagem", async () => {
    rpcMock.mockResolvedValueOnce(
      rpcResult([{ ...row, image_thumbnail: null, image_medium: null }]),
    );

    const result = await getBooksByGenres([1]);

    expect(result[0].image).toBeUndefined();
  });

  it("retorna array vazio quando a RPC não devolve nada", async () => {
    rpcMock.mockResolvedValueOnce(rpcResult(null));

    const result = await getBooksByGenres([1]);

    expect(result).toEqual([]);
  });

  it("lança erro quando a RPC falha", async () => {
    rpcMock.mockResolvedValueOnce(
      rpcResult(null, { message: "erro na consulta" }),
    );

    await expect(getBooksByGenres([1])).rejects.toThrow("erro na consulta");
  });
});
