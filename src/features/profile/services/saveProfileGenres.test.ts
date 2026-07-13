import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveProfileGenres } from "./saveProfileGenres";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const fromMock = vi.mocked(supabase.from);
const deleteEqMock = vi.fn();
const deleteMock = vi.fn(() => ({ eq: deleteEqMock }));
const insertMock = vi.fn();

describe("saveProfileGenres", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fromMock.mockReturnValue({
      delete: deleteMock,
      insert: insertMock,
    } as unknown as ReturnType<typeof supabase.from>);
    deleteEqMock.mockResolvedValue({ error: null });
    insertMock.mockResolvedValue({ error: null });
  });

  it("apaga os gêneros existentes do usuário antes de inserir", async () => {
    await saveProfileGenres("user-1", [1, 2]);

    expect(fromMock).toHaveBeenCalledWith("profile_genres");
    expect(deleteMock).toHaveBeenCalled();
    expect(deleteEqMock).toHaveBeenCalledWith("user_id", "user-1");
    expect(deleteMock.mock.invocationCallOrder[0]).toBeLessThan(
      insertMock.mock.invocationCallOrder[0],
    );
  });

  it("insere uma linha por gênero selecionado", async () => {
    await saveProfileGenres("user-1", [1, 2, 3]);

    expect(insertMock).toHaveBeenCalledWith([
      { user_id: "user-1", genre_id: 1 },
      { user_id: "user-1", genre_id: 2 },
      { user_id: "user-1", genre_id: 3 },
    ]);
  });

  it("insere lista vazia quando nenhum gênero é selecionado", async () => {
    await saveProfileGenres("user-1", []);

    expect(insertMock).toHaveBeenCalledWith([]);
  });

  it("lança o erro retornado pelo insert", async () => {
    insertMock.mockResolvedValue({ error: new Error("insert falhou") });

    await expect(saveProfileGenres("user-1", [1])).rejects.toThrow(
      "insert falhou",
    );
  });
});
