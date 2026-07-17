import { supabase } from "@/lib/supabase";
import { getProfileHeaderColor } from "./getProfileHeaderColor";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

describe("getProfileHeaderColor", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_profile_header_color e retorna a cor", async () => {
    rpcMock.mockResolvedValue(rpcResult("teal"));

    const color = await getProfileHeaderColor("user-1");

    expect(rpcMock).toHaveBeenCalledWith("get_profile_header_color", {
      p_user_id: "user-1",
    });
    expect(color).toBe("teal");
  });

  it("cai no padrão quando a RPC retorna null", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    const color = await getProfileHeaderColor("user-1");

    expect(color).toBe("purple");
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getProfileHeaderColor("user-1")).rejects.toThrow("boom");
  });
});
