import { renderHook, waitFor } from "@testing-library/react";
import { useUserProfile } from "./useUserProfile";
import { getUserProfile } from "../services/getUserProfile";
import { createWrapper } from "./testQueryClient";
import type { UserProfile } from "../dtos";

vi.mock("../services/getUserProfile", () => ({
  getUserProfile: vi.fn(),
}));

const getUserProfileMock = vi.mocked(getUserProfile);

const profile = { id: "user-2", name: "Lucas" } as unknown as UserProfile;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useUserProfile", () => {
  it("busca o perfil do userId informado", async () => {
    getUserProfileMock.mockResolvedValue(profile);

    const { result } = renderHook(() => useUserProfile("user-2"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getUserProfileMock).toHaveBeenCalledWith("user-2");
    expect(result.current.data).toEqual(profile);
  });

  it("não busca sem userId", () => {
    const { result } = renderHook(() => useUserProfile(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getUserProfileMock).not.toHaveBeenCalled();
  });
});
