import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserProfile } from "./getUserProfile";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

const rawProfile = {
  id: "user-2",
  name: "Lucas Martins",
  bio: null,
  avatar_url: null,
  city: "Campinas",
  state: "SP",
  state_id: 26,
  city_id: 3509502,
  clubs: [],
  library: { read: [], reading: [], want_to_read: [] },
};

describe("getUserProfile", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_user_profile com o id do usuário", async () => {
    rpcMock.mockResolvedValue(rpcResult(rawProfile));

    await getUserProfile("user-2");

    expect(rpcMock).toHaveBeenCalledWith("get_user_profile", {
      p_user_id: "user-2",
    });
  });

  it("mapeia o perfil de snake_case para camelCase", async () => {
    rpcMock.mockResolvedValue(rpcResult(rawProfile));

    const profile = await getUserProfile("user-2");

    expect(profile).toMatchObject({
      id: "user-2",
      name: "Lucas Martins",
      city: "Campinas",
      state: "SP",
    });
  });

  it("lança o erro retornado pela RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("RPC falhou")));

    await expect(getUserProfile("user-2")).rejects.toThrow("RPC falhou");
  });

  it("lança erro quando a RPC não retorna dados", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    await expect(getUserProfile("user-2")).rejects.toThrow(
      "Perfil não encontrado",
    );
  });
});
