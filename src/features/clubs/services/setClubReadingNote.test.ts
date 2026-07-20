import { supabase } from "@/lib/supabase";
import { setClubReadingNote } from "./clubReadings";

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

describe("setClubReadingNote", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC set_club_reading_note com a leitura e o texto", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await setClubReadingNote("reading-1", "Melhor livro do semestre.");

    expect(rpcMock).toHaveBeenCalledWith("set_club_reading_note", {
      p_reading_id: "reading-1",
      p_note: "Melhor livro do semestre.",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(new Error("apenas administradores")));

    await expect(setClubReadingNote("reading-1", "x")).rejects.toThrow(
      "apenas administradores",
    );
  });
});
