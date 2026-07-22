import { renderHook, waitFor, act } from "@testing-library/react";
import { useUpdateProfile } from "./useUpdateProfile";
import { updateProfile } from "../services/updateProfile";
import { createWrapper } from "./testQueryClient";

vi.mock("../services/updateProfile", () => ({
  updateProfile: vi.fn(),
}));

const updateProfileMock = vi.mocked(updateProfile);

const params = {
  userId: "user-1",
  name: "Ana Julia",
  bio: "leitora",
  stateId: 26,
  cityId: 3509502,
  headerColor: "purple",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useUpdateProfile", () => {
  it("atualiza o perfil com os campos informados", async () => {
    updateProfileMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(params);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // mutationFn é o service direto: o React Query passa (variables, context),
    // então conferimos só o primeiro argumento
    expect(updateProfileMock.mock.calls[0][0]).toEqual(params);
  });

  it("expõe o erro quando a atualização falha", async () => {
    updateProfileMock.mockRejectedValue(new Error("rls"));

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(params);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
