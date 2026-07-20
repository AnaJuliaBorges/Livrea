import { supabase } from "@/lib/supabase";
import { upsertNextMeeting } from "./meetings";

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

const input = {
  clubId: "club-1",
  location: "Biblioteca Central",
  date: "2026-08-01",
  time: "19:30",
};

describe("upsertNextMeeting", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC upsert_next_meeting juntando data e hora", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await upsertNextMeeting(input);

    expect(rpcMock).toHaveBeenCalledWith("upsert_next_meeting", {
      p_club_id: "club-1",
      p_location: "Biblioteca Central",
      p_meeting_date: "2026-08-01 19:30",
    });
  });

  it("faz trim do local antes de enviar", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await upsertNextMeeting({ ...input, location: "  Café Literário  " });

    expect(rpcMock).toHaveBeenCalledWith(
      "upsert_next_meeting",
      expect.objectContaining({ p_location: "Café Literário" }),
    );
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(new Error("data no passado")));

    await expect(upsertNextMeeting(input)).rejects.toThrow("data no passado");
  });
});
