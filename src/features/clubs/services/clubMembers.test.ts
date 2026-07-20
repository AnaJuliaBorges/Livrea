import { supabase } from "@/lib/supabase";
import {
  demoteClubMember,
  getClubMembers,
  promoteClubMember,
  removeClubMember,
} from "./clubMembers";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown = null, error: unknown = null) {
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

describe("promoteClubMember", () => {
  beforeEach(() => rpcMock.mockReset());

  it("chama a RPC promote_club_member com clube e usuário", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await promoteClubMember("club-1", "user-2");

    expect(rpcMock).toHaveBeenCalledWith("promote_club_member", {
      p_club_id: "club-1",
      p_user_id: "user-2",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(
      rpcResult(
        null,
        new Error("Apenas o criador do clube pode gerenciar administradores"),
      ),
    );

    await expect(promoteClubMember("club-1", "user-2")).rejects.toThrow(
      "Apenas o criador do clube pode gerenciar administradores",
    );
  });
});

describe("demoteClubMember", () => {
  beforeEach(() => rpcMock.mockReset());

  it("chama a RPC demote_club_member com clube e usuário", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await demoteClubMember("club-1", "user-2");

    expect(rpcMock).toHaveBeenCalledWith("demote_club_member", {
      p_club_id: "club-1",
      p_user_id: "user-2",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(
      rpcResult(null, new Error("O criador do clube não pode ser rebaixado")),
    );

    await expect(demoteClubMember("club-1", "user-1")).rejects.toThrow(
      "O criador do clube não pode ser rebaixado",
    );
  });
});

describe("removeClubMember", () => {
  beforeEach(() => rpcMock.mockReset());

  it("chama a RPC remove_club_member com clube e usuário", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await removeClubMember("club-1", "user-2");

    expect(rpcMock).toHaveBeenCalledWith("remove_club_member", {
      p_club_id: "club-1",
      p_user_id: "user-2",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(
      rpcResult(null, new Error("O criador do clube não pode ser removido")),
    );

    await expect(removeClubMember("club-1", "user-1")).rejects.toThrow(
      "O criador do clube não pode ser removido",
    );
  });
});
