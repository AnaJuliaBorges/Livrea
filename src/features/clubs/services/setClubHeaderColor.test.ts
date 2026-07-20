import { supabase } from "@/lib/supabase";
import { setClubHeaderColor } from "./clubs";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(error: unknown = null) {
  return { data: null, error } as unknown as Awaited<
    ReturnType<typeof supabase.rpc>
  >;
}

describe("setClubHeaderColor", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC set_club_header_color com clube e cor", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await setClubHeaderColor("club-1", "teal");

    expect(rpcMock).toHaveBeenCalledWith("set_club_header_color", {
      p_club_id: "club-1",
      p_color: "teal",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(new Error("apenas administradores")));

    await expect(setClubHeaderColor("club-1", "teal")).rejects.toThrow(
      "apenas administradores",
    );
  });
});
