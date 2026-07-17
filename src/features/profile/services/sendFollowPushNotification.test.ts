import { supabase } from "@/lib/supabase";
import { notifyNewFollower } from "./sendFollowPushNotification";

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

describe("notifyNewFollower", () => {
  it("invoca a edge function send-push com o evento new_follower", async () => {
    invokeMock.mockResolvedValue({ data: { ok: true }, error: null });

    await notifyNewFollower("user-9");

    expect(invokeMock).toHaveBeenCalledWith("send-push", {
      body: { type: "new_follower", userId: "user-9" },
    });
  });

  it("propaga o erro da function", async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: new Error("function offline"),
    });

    await expect(notifyNewFollower("user-9")).rejects.toThrow(
      "function offline",
    );
  });
});
