import { supabase } from "@/lib/supabase";
import { deleteClub } from "./clubs";

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

describe("deleteClub", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC delete_club com o id do clube", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await deleteClub("club-1");

    expect(rpcMock).toHaveBeenCalledWith("delete_club", {
      p_club_id: "club-1",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(new Error("não é admin")));

    await expect(deleteClub("club-1")).rejects.toThrow("não é admin");
  });
});
