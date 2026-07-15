import { supabase } from "@/lib/supabase";
import { requestToJoinClub } from "./requestToJoinClub";
import { getJoinRequests } from "./getJoinRequests";
import { approveJoinRequest, rejectJoinRequest } from "./reviewJoinRequest";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown = null, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

beforeEach(() => {
  rpcMock.mockReset();
});

describe("requestToJoinClub", () => {
  it("chama a RPC request_to_join_club", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await requestToJoinClub("club-1");

    expect(rpcMock).toHaveBeenCalledWith("request_to_join_club", {
      p_club_id: "club-1",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("já participa")));

    await expect(requestToJoinClub("club-1")).rejects.toThrow("já participa");
  });
});

describe("getJoinRequests", () => {
  it("chama a RPC e mapeia o retorno", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        {
          request_id: "req-1",
          user_id: "user-1",
          name: "Ana Júlia",
          avatar_url: "https://cdn/avatar.png",
        },
      ]),
    );

    const requests = await getJoinRequests("club-1");

    expect(rpcMock).toHaveBeenCalledWith("get_pending_join_requests", {
      p_club_id: "club-1",
    });
    expect(requests).toEqual([
      {
        requestId: "req-1",
        userId: "user-1",
        name: "Ana Júlia",
        avatarUrl: "https://cdn/avatar.png",
      },
    ]);
  });

  it("retorna lista vazia quando não há dados", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    expect(await getJoinRequests("club-1")).toEqual([]);
  });
});

describe("approveJoinRequest / rejectJoinRequest", () => {
  it("chama approve_join_request", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await approveJoinRequest("req-1");

    expect(rpcMock).toHaveBeenCalledWith("approve_join_request", {
      p_request_id: "req-1",
    });
  });

  it("chama reject_join_request", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await rejectJoinRequest("req-1");

    expect(rpcMock).toHaveBeenCalledWith("reject_join_request", {
      p_request_id: "req-1",
    });
  });

  it("propaga erro de approve", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("não é admin")));

    await expect(approveJoinRequest("req-1")).rejects.toThrow("não é admin");
  });
});
