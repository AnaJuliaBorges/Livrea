import { renderHook, waitFor } from "@testing-library/react";
import { useProfileHeaderColor } from "./useProfileHeaderColor";
import { getProfileHeaderColor } from "../services/getProfileHeaderColor";
import { createWrapper } from "./testQueryClient";

vi.mock("../services/getProfileHeaderColor", () => ({
  getProfileHeaderColor: vi.fn(),
}));

const getProfileHeaderColorMock = vi.mocked(getProfileHeaderColor);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useProfileHeaderColor", () => {
  it("busca a cor do cabeçalho do userId informado", async () => {
    getProfileHeaderColorMock.mockResolvedValue("purple");

    const { result } = renderHook(() => useProfileHeaderColor("user-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getProfileHeaderColorMock).toHaveBeenCalledWith("user-1");
    expect(result.current.data).toBe("purple");
  });

  it("não busca sem userId", () => {
    const { result } = renderHook(() => useProfileHeaderColor(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getProfileHeaderColorMock).not.toHaveBeenCalled();
  });
});
