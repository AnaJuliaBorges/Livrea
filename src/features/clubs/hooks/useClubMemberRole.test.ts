import { renderHook, waitFor, act } from "@testing-library/react";
import {
  useDemoteClubMember,
  usePromoteClubMember,
  useRemoveClubMember,
} from "./useClubMemberRole";
import {
  demoteClubMember,
  promoteClubMember,
  removeClubMember,
} from "../services/clubMemberRole";
import { createWrapper } from "./testQueryClient";

vi.mock("../services/clubMemberRole", () => ({
  promoteClubMember: vi.fn(),
  demoteClubMember: vi.fn(),
  removeClubMember: vi.fn(),
}));

const promoteClubMemberMock = vi.mocked(promoteClubMember);
const demoteClubMemberMock = vi.mocked(demoteClubMember);
const removeClubMemberMock = vi.mocked(removeClubMember);

beforeEach(() => {
  promoteClubMemberMock.mockReset();
  demoteClubMemberMock.mockReset();
  removeClubMemberMock.mockReset();
});

describe("usePromoteClubMember", () => {
  it("promove passando clubId (fixo) e userId (variável)", async () => {
    promoteClubMemberMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePromoteClubMember("club-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate("user-2");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(promoteClubMemberMock).toHaveBeenCalledWith("club-1", "user-2");
  });
});

describe("useDemoteClubMember", () => {
  it("rebaixa passando clubId e userId", async () => {
    demoteClubMemberMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDemoteClubMember("club-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate("user-2");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(demoteClubMemberMock).toHaveBeenCalledWith("club-1", "user-2");
  });
});

describe("useRemoveClubMember", () => {
  it("remove passando clubId e userId", async () => {
    removeClubMemberMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRemoveClubMember("club-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate("user-2");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(removeClubMemberMock).toHaveBeenCalledWith("club-1", "user-2");
  });
});
