import { supabase } from "@/lib/supabase";
import {
  notifyClubJoinRequest,
  notifyJoinRequestApproved,
  notifyMemberDemoted,
  notifyMemberPromoted,
  notifyMemberRemoved,
} from "./sendClubPushNotification";

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

describe("notifyClubJoinRequest", () => {
  it("invoca a edge function send-push com o evento join_request", async () => {
    invokeMock.mockResolvedValue({ data: { ok: true }, error: null });

    await notifyClubJoinRequest("club-1");

    expect(invokeMock).toHaveBeenCalledWith("send-push", {
      body: { type: "join_request", clubId: "club-1" },
    });
  });

  it("propaga o erro da function", async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: new Error("function offline"),
    });

    await expect(notifyClubJoinRequest("club-1")).rejects.toThrow(
      "function offline",
    );
  });
});

describe("notifyJoinRequestApproved", () => {
  it("invoca a edge function com o evento request_approved e o aprovado", async () => {
    invokeMock.mockResolvedValue({ data: { ok: true }, error: null });

    await notifyJoinRequestApproved("club-1", "user-9");

    expect(invokeMock).toHaveBeenCalledWith("send-push", {
      body: { type: "request_approved", clubId: "club-1", userId: "user-9" },
    });
  });
});

describe("eventos de cargo/remoção de membro", () => {
  it.each([
    ["member_promoted", notifyMemberPromoted],
    ["member_demoted", notifyMemberDemoted],
    ["member_removed", notifyMemberRemoved],
  ] as const)("invoca a edge function com o evento %s", async (type, notify) => {
    invokeMock.mockResolvedValue({ data: { ok: true }, error: null });

    await notify("club-1", "user-9");

    expect(invokeMock).toHaveBeenCalledWith("send-push", {
      body: { type, clubId: "club-1", userId: "user-9" },
    });
  });

  it("propaga o erro da function", async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: new Error("function offline"),
    });

    await expect(notifyMemberRemoved("club-1", "user-9")).rejects.toThrow(
      "function offline",
    );
  });
});
