import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMyProfile } from "./getMyProfile";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

const rawProfile = {
  id: "user-1",
  name: "Ana Julia",
  bio: "Leitora voraz",
  avatar_url: "https://cdn.example.com/avatar.png",
  city: "Campinas",
  state: " SP ",
  state_id: 26,
  city_id: 3509502,
  clubs: [
    {
      id: "club-1",
      name: "Clube da Fantasia",
      city: "Campinas",
      state: " SP ",
      cover_url: "https://cdn.example.com/club-1.png",
      genres: ["Fantasia"],
      is_admin: true,
      participants: 12,
      participant_limit: 20,
    },
    {
      id: "club-2",
      name: "Clube sem cidade",
      city: null,
      state: null,
      cover_url: null,
      genres: [],
      is_admin: false,
      participants: 3,
      participant_limit: null,
    },
  ],
  library: {
    read: [
      {
        id: "book-1",
        title: "O Hobbit",
        rating: 4.5,
        image_thumbnail: "thumb.png",
        image_medium: "medium.png",
        image_large: "large.png",
      },
    ],
    reading: [
      {
        id: "book-2",
        title: "Duna",
        rating: null,
        image_thumbnail: null,
        image_medium: null,
        image_large: null,
      },
    ],
    want_to_read: [],
  },
};

describe("getMyProfile", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_my_profile", async () => {
    rpcMock.mockResolvedValue(rpcResult(rawProfile));

    await getMyProfile();

    expect(rpcMock).toHaveBeenCalledWith("get_my_profile");
  });

  it("mapeia o perfil de snake_case para camelCase", async () => {
    rpcMock.mockResolvedValue(rpcResult(rawProfile));

    const profile = await getMyProfile();

    expect(profile).toMatchObject({
      id: "user-1",
      name: "Ana Julia",
      bio: "Leitora voraz",
      avatarUrl: "https://cdn.example.com/avatar.png",
      city: "Campinas",
      stateId: 26,
      cityId: 3509502,
    });
  });

  it("remove espaços extras do estado do perfil e dos clubes", async () => {
    rpcMock.mockResolvedValue(rpcResult(rawProfile));

    const profile = await getMyProfile();

    expect(profile.state).toBe("SP");
    expect(profile.clubs[0].state).toBe("SP");
  });

  it("mapeia a capa do clube (cover_url)", async () => {
    rpcMock.mockResolvedValue(rpcResult(rawProfile));

    const profile = await getMyProfile();

    expect(profile.clubs[0].coverUrl).toBe(
      "https://cdn.example.com/club-1.png",
    );
    expect(profile.clubs[1].coverUrl).toBeNull();
  });

  it("usa string vazia para cidade/estado nulos dos clubes", async () => {
    rpcMock.mockResolvedValue(rpcResult(rawProfile));

    const profile = await getMyProfile();

    expect(profile.clubs[1]).toMatchObject({
      city: "",
      state: "",
      isAdmin: false,
      participantLimit: null,
    });
  });

  it("mapeia a biblioteca com as três listas", async () => {
    rpcMock.mockResolvedValue(rpcResult(rawProfile));

    const profile = await getMyProfile();

    expect(profile.library.read).toEqual([
      {
        id: "book-1",
        title: "O Hobbit",
        rating: 4.5,
        imageThumbnail: "thumb.png",
        imageMedium: "medium.png",
        imageLarge: "large.png",
      },
    ]);
    expect(profile.library.reading).toHaveLength(1);
    expect(profile.library.reading[0].imageThumbnail).toBeNull();
    expect(profile.library.wantToRead).toEqual([]);
  });

  it("lança o erro retornado pela RPC", async () => {
    const error = new Error("RPC falhou");
    rpcMock.mockResolvedValue(rpcResult(null, error));

    await expect(getMyProfile()).rejects.toThrow("RPC falhou");
  });

  it("lança erro quando a RPC não retorna dados", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    await expect(getMyProfile()).rejects.toThrow("Perfil não encontrado");
  });
});
