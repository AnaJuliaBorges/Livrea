import { supabase } from "@/lib/supabase";
import { leaveClub } from "./leaveClub";

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

describe("leaveClub", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC leave_club com o clube", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await leaveClub("club-1");

    expect(rpcMock).toHaveBeenCalledWith("leave_club", {
      p_club_id: "club-1",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(
      rpcResult(new Error("o dono não pode sair do próprio clube")),
    );

    await expect(leaveClub("club-1")).rejects.toThrow(
      "o dono não pode sair do próprio clube",
    );
  });
});
