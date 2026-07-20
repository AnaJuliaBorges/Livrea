import { supabase } from "@/lib/supabase";
import { cancelMeetingAttendance } from "./meetings";

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

describe("cancelMeetingAttendance", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC cancel_meeting_attendance com o id do encontro", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await cancelMeetingAttendance("meeting-1");

    expect(rpcMock).toHaveBeenCalledWith("cancel_meeting_attendance", {
      p_meeting_id: "meeting-1",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(new Error("boom")));

    await expect(cancelMeetingAttendance("meeting-1")).rejects.toThrow("boom");
  });
});
