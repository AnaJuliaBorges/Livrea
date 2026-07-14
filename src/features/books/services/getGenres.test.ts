import { describe, it, expect, vi, beforeEach } from "vitest";
import { getGenres } from "./getGenres";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const fromMock = vi.mocked(supabase.from);
const orderMock = vi.fn();
const selectMock = vi.fn(() => ({ order: orderMock }));

beforeEach(() => {
  vi.clearAllMocks();
  fromMock.mockReturnValue({
    select: selectMock,
  } as unknown as ReturnType<typeof supabase.from>);
});

describe("getGenres", () => {
  it("retorna os gêneros ordenados por nome", async () => {
    const genres = [
      { id: 1, name: "Fantasia", google_category: ["Fiction/Fantasy"] },
    ];
    orderMock.mockResolvedValue({ data: genres, error: null });

    const result = await getGenres();

    expect(fromMock).toHaveBeenCalledWith("genres");
    expect(selectMock).toHaveBeenCalledWith("id, name, google_category");
    expect(orderMock).toHaveBeenCalledWith("name");
    expect(result).toEqual(genres);
  });

  it("retorna array vazio quando data é null", async () => {
    orderMock.mockResolvedValue({ data: null, error: null });

    expect(await getGenres()).toEqual([]);
  });

  it("lança erro quando a consulta falha", async () => {
    orderMock.mockResolvedValue({
      data: null,
      error: { message: "falha na consulta" },
    });

    await expect(getGenres()).rejects.toThrow("falha na consulta");
  });
});
