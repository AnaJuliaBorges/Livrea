import { supabase } from "@/lib/supabase";
import { notifyClubMessage } from "./sendChatPushNotification";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const invokeMock = vi.mocked(supabase.functions.invoke);

beforeEach(() => {
  invokeMock.mockReset();
});

describe("notifyClubMessage", () => {
  it("invoca a edge function send-push com o evento club_message", async () => {
    invokeMock.mockResolvedValue({ data: { ok: true }, error: null });

    await notifyClubMessage("club-1");

    expect(invokeMock).toHaveBeenCalledWith("send-push", {
      body: { type: "club_message", clubId: "club-1" },
    });
  });

  it("propaga o erro da function", async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: new Error("function offline"),
    });

    await expect(notifyClubMessage("club-1")).rejects.toThrow(
      "function offline",
    );
  });
});
