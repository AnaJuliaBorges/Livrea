import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadAvatar } from "./uploadAvatar";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    storage: {
      from: vi.fn(),
    },
    from: vi.fn(),
  },
}));

const getSessionMock = vi.mocked(supabase.auth.getSession);
const storageFromMock = vi.mocked(supabase.storage.from);
const fromMock = vi.mocked(supabase.from);

const uploadMock = vi.fn();
const getPublicUrlMock = vi.fn();
const updateEqMock = vi.fn();
const updateMock = vi.fn(() => ({ eq: updateEqMock }));

const publicUrl = "https://cdn.example.com/avatars/user-1/avatar.png";
const file = new File(["conteudo"], "foto.png", { type: "image/png" });

function mockSession(userId: string | null) {
  getSessionMock.mockResolvedValue({
    data: {
      session: userId ? { user: { id: userId } } : null,
    },
    error: null,
  } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>);
}

describe("uploadAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession("user-1");
    storageFromMock.mockReturnValue({
      upload: uploadMock,
      getPublicUrl: getPublicUrlMock,
    } as unknown as ReturnType<typeof supabase.storage.from>);
    fromMock.mockReturnValue({
      update: updateMock,
    } as unknown as ReturnType<typeof supabase.from>);
    uploadMock.mockResolvedValue({ error: null });
    getPublicUrlMock.mockReturnValue({ data: { publicUrl } });
    updateEqMock.mockResolvedValue({ error: null });
  });

  it("lança erro quando não há sessão", async () => {
    mockSession(null);

    await expect(uploadAvatar("user-1", file)).rejects.toThrow(
      /Sessão não encontrada/,
    );
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("lança erro quando a sessão pertence a outro usuário", async () => {
    mockSession("outro-usuario");

    await expect(uploadAvatar("user-1", file)).rejects.toThrow(
      /Sessão não encontrada/,
    );
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("sobe o arquivo para avatars/<userId>/avatar.<extensão> com upsert", async () => {
    await uploadAvatar("user-1", file);

    expect(storageFromMock).toHaveBeenCalledWith("avatars");
    expect(uploadMock).toHaveBeenCalledWith("user-1/avatar.png", file, {
      upsert: true,
      contentType: "image/png",
    });
  });

  it("salva a URL pública no perfil e a retorna", async () => {
    const result = await uploadAvatar("user-1", file);

    expect(getPublicUrlMock).toHaveBeenCalledWith("user-1/avatar.png");
    expect(fromMock).toHaveBeenCalledWith("profiles");
    expect(updateMock).toHaveBeenCalledWith({ avatar_url: publicUrl });
    expect(updateEqMock).toHaveBeenCalledWith("id", "user-1");
    expect(result).toBe(publicUrl);
  });

  it("deriva a extensão do MIME validado, ignorando o nome do arquivo", async () => {
    const dotted = new File(["x"], "foto.perfil.html", { type: "image/jpeg" });

    await uploadAvatar("user-1", dotted);

    expect(uploadMock).toHaveBeenCalledWith(
      "user-1/avatar.jpg",
      dotted,
      expect.anything(),
    );
  });

  it("rejeita arquivo com MIME fora da whitelist de imagens", async () => {
    const html = new File(["<script>"], "avatar.png", { type: "text/html" });

    await expect(uploadAvatar("user-1", html)).rejects.toThrow(
      /Formato de imagem não suportado/,
    );
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("lança o erro do upload e não atualiza o perfil", async () => {
    uploadMock.mockResolvedValue({ error: new Error("upload falhou") });

    await expect(uploadAvatar("user-1", file)).rejects.toThrow("upload falhou");
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("lança o erro da atualização do perfil", async () => {
    updateEqMock.mockResolvedValue({ error: new Error("update falhou") });

    await expect(uploadAvatar("user-1", file)).rejects.toThrow("update falhou");
  });
});
