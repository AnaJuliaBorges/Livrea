import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateProfile } from "./updateProfile";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const fromMock = vi.mocked(supabase.from);
const eqMock = vi.fn();
const updateMock = vi.fn(() => ({ eq: eqMock }));

const params = {
  userId: "user-1",
  name: "Ana Julia",
  bio: "Leitora voraz",
  stateId: 26,
  cityId: 3509502,
};

describe("updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fromMock.mockReturnValue({
      update: updateMock,
    } as unknown as ReturnType<typeof supabase.from>);
    eqMock.mockResolvedValue({ error: null });
  });

  it("atualiza a tabela profiles com os campos em snake_case", async () => {
    await updateProfile(params);

    expect(fromMock).toHaveBeenCalledWith("profiles");
    expect(updateMock).toHaveBeenCalledWith({
      name: "Ana Julia",
      bio: "Leitora voraz",
      state_id: 26,
      city_id: 3509502,
    });
    expect(eqMock).toHaveBeenCalledWith("id", "user-1");
  });

  it("lança o erro retornado pelo Supabase", async () => {
    eqMock.mockResolvedValue({ error: new Error("update falhou") });

    await expect(updateProfile(params)).rejects.toThrow("update falhou");
  });
});
