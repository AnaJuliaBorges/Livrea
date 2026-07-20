import { supabase } from "@/lib/supabase";
import { setClubReading } from "./clubReadings";

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

describe("setClubReading", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC set_club_reading com o clube e o livro", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await setClubReading("club-1", "book-1");

    expect(rpcMock).toHaveBeenCalledWith("set_club_reading", {
      p_club_id: "club-1",
      p_book_id: "book-1",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(new Error("não é admin")));

    await expect(setClubReading("club-1", "book-1")).rejects.toThrow(
      "não é admin",
    );
  });
});
