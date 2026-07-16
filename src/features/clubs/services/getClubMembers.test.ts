import { supabase } from "@/lib/supabase";
import { getClubMembers } from "./getClubMembers";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

describe("getClubMembers", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_club_members e mapeia o retorno", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        {
          id: "user-1",
          name: "Ana Júlia Borges",
          avatar_url: "https://cdn/avatars/user-1.png",
          is_admin: true,
          is_owner: true,
        },
        {
          id: "user-2",
          name: "Lucas Martins",
          avatar_url: null,
          is_admin: false,
          is_owner: false,
        },
      ]),
    );

    const members = await getClubMembers("club-1");

    expect(rpcMock).toHaveBeenCalledWith("get_club_members", {
      p_club_id: "club-1",
    });
    expect(members).toEqual([
      {
        id: "user-1",
        name: "Ana Júlia Borges",
        avatarUrl: "https://cdn/avatars/user-1.png",
        isAdmin: true,
        isOwner: true,
      },
      {
        id: "user-2",
        name: "Lucas Martins",
        avatarUrl: null,
        isAdmin: false,
        isOwner: false,
      },
    ]);
  });

  it("retorna lista vazia quando a RPC não retorna dados", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    const members = await getClubMembers("club-1");

    expect(members).toEqual([]);
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getClubMembers("club-1")).rejects.toThrow("boom");
  });
});
