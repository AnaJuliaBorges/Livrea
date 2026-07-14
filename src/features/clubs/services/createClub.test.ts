import { supabase } from "@/lib/supabase";
import { createClub, type CreateClubInput } from "./createClub";
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

function rpcResult(data: unknown, error: unknown = null) {
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
