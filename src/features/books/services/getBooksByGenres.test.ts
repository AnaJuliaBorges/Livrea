import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBooksByGenres } from "./getBooksByGenres";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const fromMock = vi.mocked(supabase.from);

function chain(result: { data: unknown; error: unknown }) {
  const limit = vi.fn().mockResolvedValue(result);
  const order = vi.fn(() => ({ limit }));
  const inFn = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ in: inFn }));
  return { select, in: inFn, order, limit } as unknown as ReturnType<
    typeof supabase.from
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
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("mapeia os livros retornados pela junção book_genres", async () => {
    fromMock.mockReturnValueOnce(chain({ data: [row], error: null }));

    const result = await getBooksByGenres([1, 2]);

    expect(result).toEqual([
      {
        id: "book-1",
        isbn: "123",
        title: "Título traduzido",
        image: "thumb.jpg",
      },
    ]);
    expect(fromMock).toHaveBeenCalledTimes(1);
  });

  it("usa title_original quando não há title_pt", async () => {
    fromMock.mockReturnValueOnce(
      chain({ data: [{ ...row, title_pt: null }], error: null }),
    );

    const result = await getBooksByGenres([1]);

    expect(result[0].title).toBe("Título original");
  });

  it("usa image_medium quando não há image_thumbnail", async () => {
    fromMock.mockReturnValueOnce(
      chain({
        data: [{ ...row, image_thumbnail: null }],
        error: null,
      }),
    );

    const result = await getBooksByGenres([1]);

    expect(result[0].image).toBe("medium.jpg");
  });

  it("deixa image undefined quando não há nenhuma imagem", async () => {
    fromMock.mockReturnValueOnce(
      chain({
        data: [{ ...row, image_thumbnail: null, image_medium: null }],
        error: null,
      }),
    );

    const result = await getBooksByGenres([1]);

    expect(result[0].image).toBeUndefined();
  });

  it("cai no fallback por primary_genre_id quando a junção não retorna nada", async () => {
    fromMock
      .mockReturnValueOnce(chain({ data: [], error: null }))
      .mockReturnValueOnce(chain({ data: [row], error: null }));

    const result = await getBooksByGenres([1]);

    expect(fromMock).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(1);
  });

  it("lança erro quando a consulta principal falha", async () => {
    fromMock.mockReturnValueOnce(
      chain({ data: null, error: { message: "erro na consulta" } }),
    );

    await expect(getBooksByGenres([1])).rejects.toThrow("erro na consulta");
  });

  it("lança erro quando o fallback falha", async () => {
    fromMock
      .mockReturnValueOnce(chain({ data: [], error: null }))
      .mockReturnValueOnce(
        chain({ data: null, error: { message: "erro no fallback" } }),
      );

    await expect(getBooksByGenres([1])).rejects.toThrow("erro no fallback");
  });

  it("retorna array vazio quando o fallback também não encontra nada", async () => {
    fromMock
      .mockReturnValueOnce(chain({ data: [], error: null }))
      .mockReturnValueOnce(chain({ data: null, error: null }));

    const result = await getBooksByGenres([1]);

    expect(result).toEqual([]);
  });
});
