import { supabase } from "@/lib/supabase";
import { deleteClubReading } from "./clubReadings";

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

describe("deleteClubReading", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC delete_club_reading com o id do clube", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await deleteClubReading("club-1");

    expect(rpcMock).toHaveBeenCalledWith("delete_club_reading", {
      p_club_id: "club-1",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(
      rpcResult(new Error("O clube não tem uma leitura atual")),
    );

    await expect(deleteClubReading("club-1")).rejects.toThrow(
      "O clube não tem uma leitura atual",
    );
  });
});
