import { supabase } from "@/lib/supabase";
import { confirmMeetingAttendance } from "./confirmMeetingAttendance";

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

describe("confirmMeetingAttendance", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC confirm_meeting_attendance com o id do encontro", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await confirmMeetingAttendance("meeting-1");

    expect(rpcMock).toHaveBeenCalledWith("confirm_meeting_attendance", {
      p_meeting_id: "meeting-1",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(new Error("boom")));

    await expect(confirmMeetingAttendance("meeting-1")).rejects.toThrow(
      "boom",
    );
  });
});
