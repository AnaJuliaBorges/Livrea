import { supabase } from "@/lib/supabase";
import { uploadClubCover } from "./uploadClubCover";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    storage: {
      from: vi.fn(),
    },
  },
}));

const getSessionMock = vi.mocked(supabase.auth.getSession);
const storageFromMock = vi.mocked(supabase.storage.from);

const uploadMock = vi.fn();
const getPublicUrlMock = vi.fn();

const publicUrl = "https://cdn.example.com/club-covers/user-1/123.png";
const file = new File(["conteudo"], "capa.png", { type: "image/png" });

function mockSession(userId: string | null) {
  getSessionMock.mockResolvedValue({
    data: {
      session: userId ? { user: { id: userId } } : null,
    },
    error: null,
  } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>);
}

describe("uploadClubCover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(123);
    mockSession("user-1");
    storageFromMock.mockReturnValue({
      upload: uploadMock,
      getPublicUrl: getPublicUrlMock,
    } as unknown as ReturnType<typeof supabase.storage.from>);
    uploadMock.mockResolvedValue({ error: null });
    getPublicUrlMock.mockReturnValue({ data: { publicUrl } });
  });

  it("lança erro quando não há sessão", async () => {
    mockSession(null);

    await expect(uploadClubCover(file)).rejects.toThrow(
      /Sessão não encontrada/,
    );
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("sobe o arquivo para <userId>/<timestamp>.<extensão> no bucket club-covers", async () => {
    await uploadClubCover(file);

    expect(storageFromMock).toHaveBeenCalledWith("club-covers");
    expect(uploadMock).toHaveBeenCalledWith("user-1/123.png", file, {
      contentType: "image/png",
    });
  });

  it("usa a última parte do nome como extensão", async () => {
    const dotted = new File(["x"], "minha.capa.jpeg", { type: "image/jpeg" });

    await uploadClubCover(dotted);

    expect(uploadMock).toHaveBeenCalledWith(
      "user-1/123.jpeg",
      dotted,
      expect.anything(),
    );
  });

  it("retorna a URL pública da capa", async () => {
    const result = await uploadClubCover(file);

    expect(getPublicUrlMock).toHaveBeenCalledWith("user-1/123.png");
    expect(result).toBe(publicUrl);
  });

  it("propaga o erro do upload", async () => {
    uploadMock.mockResolvedValue({ error: new Error("upload falhou") });

    await expect(uploadClubCover(file)).rejects.toThrow("upload falhou");
    expect(getPublicUrlMock).not.toHaveBeenCalled();
  });
});
