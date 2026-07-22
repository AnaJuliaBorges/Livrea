import { renderHook, waitFor } from "@testing-library/react";
import { useMyProfile } from "./useMyProfile";
import { getMyProfile } from "../services/getMyProfile";
import { createWrapper } from "./testQueryClient";
import type { UserProfile } from "../dtos";

vi.mock("../services/getMyProfile", () => ({
  getMyProfile: vi.fn(),
}));

const getMyProfileMock = vi.mocked(getMyProfile);

const profile = { id: "user-1", name: "Ana" } as unknown as UserProfile;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useMyProfile", () => {
  it("busca o próprio perfil quando habilitado", async () => {
    getMyProfileMock.mockResolvedValue(profile);

    const { result } = renderHook(() => useMyProfile(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(profile);
    expect(getMyProfileMock).toHaveBeenCalledTimes(1);
  });

  it("não busca quando desabilitado", () => {
    const { result } = renderHook(() => useMyProfile(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getMyProfileMock).not.toHaveBeenCalled();
  });

  it("expõe o erro quando a busca falha", async () => {
    getMyProfileMock.mockRejectedValue(new Error("sem sessão"));

    const { result } = renderHook(() => useMyProfile(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
