import { supabase } from "@/lib/supabase";
import { updateClub } from "./clubs";
import { upsertNextMeeting } from "./meetings";

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

describe("updateClub", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("envia só o campo editado; os demais vão null (não alterar)", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await updateClub({ clubId: "club-1", description: "Nova descrição" });

    expect(rpcMock).toHaveBeenCalledWith("update_club", {
      p_club_id: "club-1",
      p_name: null,
      p_description: "Nova descrição",
      p_rules: null,
      p_meeting_description: null,
      p_genre_ids: null,
      p_city_id: null,
      p_type: null,
    });
  });

  it("envia nome e gêneros quando informados", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await updateClub({ clubId: "club-1", name: "Novo nome", genreIds: [1, 2] });

    expect(rpcMock).toHaveBeenCalledWith(
      "update_club",
      expect.objectContaining({ p_name: "Novo nome", p_genre_ids: [1, 2] }),
    );
  });

  it("envia cidade e tipo de encontro quando informados", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await updateClub({ clubId: "club-1", cityId: 42, meetingType: "online" });

    expect(rpcMock).toHaveBeenCalledWith(
      "update_club",
      expect.objectContaining({ p_city_id: 42, p_type: "online" }),
    );
  });

  it("permite limpar um campo com string vazia", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await updateClub({ clubId: "club-1", rules: "" });

    expect(rpcMock).toHaveBeenCalledWith(
      "update_club",
      expect.objectContaining({ p_rules: "" }),
    );
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(new Error("não é admin")));

    await expect(
      updateClub({ clubId: "club-1", description: "x" }),
    ).rejects.toThrow("não é admin");
  });
});

describe("upsertNextMeeting", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("combina data e hora no formato esperado pela RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await upsertNextMeeting({
      clubId: "club-1",
      location: "  Livraria X  ",
      date: "2026-08-01",
      time: "19:00",
    });

    expect(rpcMock).toHaveBeenCalledWith("upsert_next_meeting", {
      p_club_id: "club-1",
      p_location: "Livraria X",
      p_meeting_date: "2026-08-01 19:00",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(new Error("boom")));

    await expect(
      upsertNextMeeting({
        clubId: "club-1",
        location: "Livraria X",
        date: "2026-08-01",
        time: "19:00",
      }),
    ).rejects.toThrow("boom");
  });
});
