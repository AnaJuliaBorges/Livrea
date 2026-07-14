import { supabase } from "@/lib/supabase";
import { listClubs } from "./listClubs";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

const rawClub = {
  id: "club-1",
  name: "Clube da Fantasia",
  description: "Lemos fantasia",
  cover_url: "https://cdn/club-covers/uid/1.png",
  visibility: true,
  participant_limit: 20,
  frequency: "monthly",
  custom_frequency: null,
  type: "in_person",
  city_name: "Campinas",
  state_sigla: "SP",
  member_count: 3,
  genres: [
    { id: 1, name: "Fantasia" },
    { id: 2, name: "Terror" },
  ],
  is_member: true,
  is_admin: true,
  match_group: "city" as const,
};

describe("listClubs", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC list_clubs e mapeia o retorno para ClubListItem", async () => {
    rpcMock.mockResolvedValue(rpcResult([rawClub]));

    const result = await listClubs({ cityId: 42, stateId: 7 });

    expect(rpcMock).toHaveBeenCalledWith("list_clubs", {
      p_only_mine: false,
      p_city_id: 42,
      p_state_id: 7,
      p_search: null,
      p_limit: 50,
      p_offset: 0,
    });
    expect(result).toEqual([
      {
        id: "club-1",
        name: "Clube da Fantasia",
        description: "Lemos fantasia",
        coverUrl: "https://cdn/club-covers/uid/1.png",
        isPrivate: false,
        city: "Campinas",
        state: "SP",
        genres: ["Fantasia", "Terror"],
        isAdmin: true,
        isMember: true,
        participants: 3,
        participantLimit: 20,
        matchGroup: "city",
      },
    ]);
  });

  it("envia p_only_mine e trata campos nulos, sem localização", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        {
          ...rawClub,
          description: null,
          cover_url: null,
          visibility: false,
          city_name: null,
          state_sigla: null,
          genres: [],
          participant_limit: null,
          match_group: "other",
        },
      ]),
    );

    const [club] = await listClubs({ onlyMine: true });

    expect(rpcMock).toHaveBeenCalledWith("list_clubs", {
      p_only_mine: true,
      p_city_id: null,
      p_state_id: null,
      p_search: null,
      p_limit: 50,
      p_offset: 0,
    });
    expect(club).toMatchObject({
      description: "",
      coverUrl: null,
      isPrivate: true,
      city: "",
      state: "",
      genres: [],
      participantLimit: null,
      matchGroup: "other",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(listClubs()).rejects.toThrow("boom");
  });
});
