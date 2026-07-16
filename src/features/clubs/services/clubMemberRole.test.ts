import { supabase } from "@/lib/supabase";
import {
  demoteClubMember,
  promoteClubMember,
  removeClubMember,
} from "./clubMemberRole";

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
      rpcResult(new Error("Apenas o criador do clube pode gerenciar administradores")),
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
      rpcResult(new Error("O criador do clube não pode ser rebaixado")),
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
      rpcResult(new Error("O criador do clube não pode ser removido")),
    );

    await expect(removeClubMember("club-1", "user-1")).rejects.toThrow(
      "O criador do clube não pode ser removido",
    );
  });
});
