import { supabase } from "@/lib/supabase";
import { getClub } from "./clubs";

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
    rpcMock.mockResolvedValue(rpcResult(rawClub));

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
        ...rawClub,
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
        ...rawClub,
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
