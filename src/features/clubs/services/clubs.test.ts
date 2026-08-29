import { supabase } from "@/lib/supabase";
import {
  createClub,
  deleteClub,
  getClub,
  leaveClub,
  listClubs,
  setClubHeaderColor,
  updateClub,
  type CreateClubInput,
} from "./clubs";
import { uploadClubCover } from "./uploadClubCover";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

vi.mock("./uploadClubCover", () => ({
  uploadClubCover: vi.fn(),
}));

const rpcMock = vi.mocked(supabase.rpc);
const uploadCoverMock = vi.mocked(uploadClubCover);

function rpcResult(data: unknown = null, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

const baseInput: CreateClubInput = {
  clubName: "  Clube da Fantasia  ",
  description: "Lemos fantasia todo mês",
  rules: "Respeito sempre",
  frequency: "mensal",
  customFrequency: "",
  meetingType: "presencial",
  cityId: "42",
  privacy: "publico",
  hasLimit: "nao",
  maxParticipants: "",
  meetingDescription: "",
  selectedGenres: [1, 3],
  coverFile: null,
};

describe("createClub", () => {
  beforeEach(() => {
    rpcMock.mockReset();
    uploadCoverMock.mockReset();
  });

  it("mapeia os valores do wizard para os parâmetros da RPC create_club", async () => {
    rpcMock.mockResolvedValue(
      rpcResult({ id: "club-1", name: "Clube da Fantasia" }),
    );

    const result = await createClub(baseInput);

    expect(rpcMock).toHaveBeenCalledWith("create_club", {
      p_name: "Clube da Fantasia",
      p_description: "Lemos fantasia todo mês",
      p_rules: "Respeito sempre",
      p_visibility: true,
      p_city_id: 42,
      p_frequency: "monthly",
      p_custom_frequency: null,
      p_type: "in_person",
      p_participant_limit: null,
      p_meeting_description: null,
      p_genre_ids: [1, 3],
      p_cover_url: null,
    });
    expect(uploadCoverMock).not.toHaveBeenCalled();
    expect(result).toEqual({ id: "club-1", name: "Clube da Fantasia" });
  });

  it("sobe a capa antes de criar o clube e envia a URL pública", async () => {
    const coverFile = new File(["img"], "capa.png", { type: "image/png" });
    uploadCoverMock.mockResolvedValue("https://cdn/club-covers/uid/1.png");
    rpcMock.mockResolvedValue(rpcResult({ id: "club-3", name: "Com capa" }));

    await createClub({ ...baseInput, coverFile });

    expect(uploadCoverMock).toHaveBeenCalledWith(coverFile);
    expect(rpcMock).toHaveBeenCalledWith(
      "create_club",
      expect.objectContaining({
        p_cover_url: "https://cdn/club-covers/uid/1.png",
      }),
    );
  });

  it("envia frequência custom, privacidade fechada e limite de participantes", async () => {
    rpcMock.mockResolvedValue(rpcResult({ id: "club-2", name: "Outro" }));

    await createClub({
      ...baseInput,
      frequency: "outro",
      customFrequency: " a cada 45 dias ",
      meetingType: "hibrido",
      privacy: "privado",
      hasLimit: "sim",
      maxParticipants: "20",
      meetingDescription: "Última quinta do mês",
    });

    expect(rpcMock).toHaveBeenCalledWith(
      "create_club",
      expect.objectContaining({
        p_visibility: false,
        p_frequency: "custom",
        p_custom_frequency: "a cada 45 dias",
        p_type: "hybrid",
        p_participant_limit: 20,
        p_meeting_description: "Última quinta do mês",
      }),
    );
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("RLS")));

    await expect(createClub(baseInput)).rejects.toThrow("RLS");
  });
});

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
    rpcMock.mockResolvedValue(rpcResult(null, new Error("não é admin")));

    await expect(
      updateClub({ clubId: "club-1", description: "x" }),
    ).rejects.toThrow("não é admin");
  });
});

describe("deleteClub", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC delete_club com o id do clube", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await deleteClub("club-1");

    expect(rpcMock).toHaveBeenCalledWith("delete_club", {
      p_club_id: "club-1",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("não é admin")));

    await expect(deleteClub("club-1")).rejects.toThrow("não é admin");
  });
});

const rawClubDetail = {
  id: "club-1",
  name: "Clube da Fantasia",
  description: "Lemos fantasia",
  rules: "Respeite todo mundo.",
  cover_url: "https://cdn/club-covers/uid/1.png",
  header_color: "teal",
  visibility: true,
  participant_limit: 20,
  frequency: "monthly",
  custom_frequency: null,
  type: "in_person",
  meeting_description: "Toda última quinta às 19h",
  city_id: 101,
  state_id: 25,
  city_name: "Campinas",
  state_sigla: "SP",
  member_count: 5,
  genres: [{ id: 1, name: "Fantasia" }],
  is_member: true,
  is_admin: false,
  is_owner: false,
  has_pending_request: false,
  current_reading: { id: "book-1", title: "Duna" },
  next_meeting: {
    id: "meeting-1",
    location: "Livraria X",
    date: "2026-08-01",
    time: "19:00",
    confirmed_members: 3,
    is_confirmed_by_me: false,
  },
  reading_history: [
    {
      reading_id: "reading-1",
      id: "book-2",
      title: "O Hobbit",
      image_thumbnail: "thumb.png",
      image_medium: "medium.png",
      image_large: "large.png",
      note: "Leitura que rendeu o melhor encontro do ano.",
    },
  ],
};

describe("getClub", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_club e mapeia o retorno", async () => {
    rpcMock.mockResolvedValue(rpcResult(rawClubDetail));

    const club = await getClub("club-1");

    expect(rpcMock).toHaveBeenCalledWith("get_club", { p_club_id: "club-1" });
    expect(club).toEqual({
      id: "club-1",
      name: "Clube da Fantasia",
      description: "Lemos fantasia",
      coverUrl: "https://cdn/club-covers/uid/1.png",
      headerColor: "teal",
      isPrivate: false,
      isMember: true,
      isAdmin: false,
      isOwner: false,
      hasPendingRequest: false,
      participantLimit: 20,
      type: "in_person",
      frequency: "monthly",
      customFrequency: null,
      currentReading: { id: "book-1", title: "Duna" },
      genres: [{ id: 1, name: "Fantasia" }],
      cityId: 101,
      stateId: 25,
      cityName: "Campinas",
      stateAbbreviation: "SP",
      totalParticipants: 5,
      meetingDescription: "Toda última quinta às 19h",
      nextMeeting: {
        id: "meeting-1",
        location: "Livraria X",
        date: "2026-08-01",
        time: "19:00",
        confirmedMembers: 3,
        isConfirmedByMe: false,
      },
      rules: "Respeite todo mundo.",
      readingHistory: [
        {
          readingId: "reading-1",
          id: "book-2",
          title: "O Hobbit",
          imageThumbnail: "thumb.png",
          imageMedium: "medium.png",
          imageLarge: "large.png",
          note: "Leitura que rendeu o melhor encontro do ano.",
        },
      ],
    });
  });

  it("sem reading_id/note (RPC antiga), usa o id do livro e nota null", async () => {
    rpcMock.mockResolvedValue(
      rpcResult({
        ...rawClubDetail,
        reading_history: [
          {
            id: "book-2",
            title: "O Hobbit",
            image_thumbnail: null,
            image_medium: null,
            image_large: null,
          },
        ],
      }),
    );

    const club = await getClub("club-1");

    expect(club?.readingHistory[0]).toMatchObject({
      readingId: "book-2",
      note: null,
    });
  });

  it("retorna null quando a RPC não retorna dados (clube não encontrado ou privado)", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    const club = await getClub("club-x");

    expect(club).toBeNull();
  });

  it("trata campos nulos com fallback", async () => {
    rpcMock.mockResolvedValue(
      rpcResult({
        ...rawClubDetail,
        description: null,
        rules: null,
        meeting_description: null,
        city_name: null,
        state_sigla: null,
        next_meeting: null,
        header_color: null,
      }),
    );

    const club = await getClub("club-1");

    expect(club).toMatchObject({
      description: "",
      rules: "",
      meetingDescription: "",
      cityName: "",
      stateAbbreviation: "",
      nextMeeting: null,
      headerColor: "purple",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getClub("club-1")).rejects.toThrow("boom");
  });
});

const rawClubListItem = {
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
    rpcMock.mockResolvedValue(rpcResult([rawClubListItem]));

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
        genreIds: [1, 2],
        isAdmin: true,
        isMember: true,
        participants: 3,
        participantLimit: 20,
        matchGroup: "city",
        meetingType: "in_person",
      },
    ]);
  });

  it("envia p_only_mine e trata campos nulos, sem localização", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        {
          ...rawClubListItem,
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

describe("leaveClub", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC leave_club com o clube", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await leaveClub("club-1");

    expect(rpcMock).toHaveBeenCalledWith("leave_club", {
      p_club_id: "club-1",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(
      rpcResult(null, new Error("o dono não pode sair do próprio clube")),
    );

    await expect(leaveClub("club-1")).rejects.toThrow(
      "o dono não pode sair do próprio clube",
    );
  });
});

describe("setClubHeaderColor", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC set_club_header_color com clube e cor", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await setClubHeaderColor("club-1", "teal");

    expect(rpcMock).toHaveBeenCalledWith("set_club_header_color", {
      p_club_id: "club-1",
      p_color: "teal",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("apenas administradores")));

    await expect(setClubHeaderColor("club-1", "teal")).rejects.toThrow(
      "apenas administradores",
    );
  });
});
