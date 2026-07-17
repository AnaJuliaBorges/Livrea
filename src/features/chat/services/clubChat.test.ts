import { supabase } from "@/lib/supabase";
import { getClubMessages, sendClubMessage } from "./clubChat";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

const rawMessage = {
  id: "msg-1",
  content: "Terminei o capítulo 5!",
  is_spoiler: false,
  created_at: "2026-07-17T14:22:00Z",
  is_mine: false,
  author: {
    id: "user-2",
    name: "Lucas Martins",
    avatar_url: null,
    is_admin: true,
  },
};

describe("getClubMessages", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_club_messages e mapeia pra camelCase", async () => {
    rpcMock.mockResolvedValue(rpcResult([rawMessage]));

    const messages = await getClubMessages("club-1");

    expect(rpcMock).toHaveBeenCalledWith("get_club_messages", {
      p_club_id: "club-1",
    });
    expect(messages).toEqual([
      {
        id: "msg-1",
        content: "Terminei o capítulo 5!",
        isSpoiler: false,
        createdAt: "2026-07-17T14:22:00Z",
        isMine: false,
        author: {
          id: "user-2",
          name: "Lucas Martins",
          avatarUrl: null,
          isAdmin: true,
        },
      },
    ]);
  });

  it("retorna lista vazia quando a RPC devolve null", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    await expect(getClubMessages("club-1")).resolves.toEqual([]);
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getClubMessages("club-1")).rejects.toThrow("boom");
  });
});

describe("sendClubMessage", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC send_club_message com conteúdo e flag de spoiler", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    await sendClubMessage("club-1", "O dragão morre", true);

    expect(rpcMock).toHaveBeenCalledWith("send_club_message", {
      p_club_id: "club-1",
      p_content: "O dragão morre",
      p_is_spoiler: true,
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(
      rpcResult(null, new Error("apenas participantes")),
    );

    await expect(sendClubMessage("club-1", "oi", false)).rejects.toThrow(
      "apenas participantes",
    );
  });
});
