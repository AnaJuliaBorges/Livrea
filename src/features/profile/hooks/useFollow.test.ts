import { renderHook, waitFor, act } from "@testing-library/react";
import {
  useFollowInfo,
  useFollowers,
  useFollowing,
  useFollowUser,
  useUnfollow,
  useUnfollowUser,
} from "./useFollow";
import {
  followUser,
  getFollowers,
  getFollowing,
  getFollowInfo,
  unfollowUser,
} from "../services/follows";
import { notifyNewFollower } from "../services/sendFollowPushNotification";
import { toast } from "sonner";
import { createWrapper } from "./testQueryClient";

vi.mock("../services/follows", () => ({
  followUser: vi.fn(),
  unfollowUser: vi.fn(),
  getFollowers: vi.fn(),
  getFollowing: vi.fn(),
  getFollowInfo: vi.fn(),
}));
vi.mock("../services/sendFollowPushNotification", () => ({
  notifyNewFollower: vi.fn(),
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

const followUserMock = vi.mocked(followUser);
const unfollowUserMock = vi.mocked(unfollowUser);
const getFollowersMock = vi.mocked(getFollowers);
const getFollowingMock = vi.mocked(getFollowing);
const getFollowInfoMock = vi.mocked(getFollowInfo);
const notifyNewFollowerMock = vi.mocked(notifyNewFollower);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useFollowInfo", () => {
  it("busca as contagens quando há userId", async () => {
    getFollowInfoMock.mockResolvedValue({
      followersCount: 3,
      followingCount: 1,
      isFollowing: true,
    });

    const { result } = renderHook(() => useFollowInfo("user-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getFollowInfoMock).toHaveBeenCalledWith("user-1");
    expect(result.current.data?.followersCount).toBe(3);
  });

  it("não busca sem userId", () => {
    const { result } = renderHook(() => useFollowInfo(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getFollowInfoMock).not.toHaveBeenCalled();
  });
});

describe("useFollowers / useFollowing", () => {
  it("busca seguidores quando habilitado", async () => {
    getFollowersMock.mockResolvedValue([
      { id: "u2", name: "Ana", avatarUrl: null },
    ]);

    const { result } = renderHook(() => useFollowers("user-1", true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getFollowersMock).toHaveBeenCalledWith("user-1");
  });

  it("não busca seguidores quando desabilitado", () => {
    const { result } = renderHook(() => useFollowers("user-1", false), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getFollowersMock).not.toHaveBeenCalled();
  });

  it("busca quem segue quando habilitado", async () => {
    getFollowingMock.mockResolvedValue([]);

    const { result } = renderHook(() => useFollowing("user-1", true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getFollowingMock).toHaveBeenCalledWith("user-1");
  });

  it("não busca quem segue quando desabilitado", () => {
    const { result } = renderHook(() => useFollowing("user-1", false), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getFollowingMock).not.toHaveBeenCalled();
  });
});

describe("useUnfollow", () => {
  it("deixa de seguir o alvo informado", async () => {
    unfollowUserMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUnfollow("owner-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate("target-9");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(unfollowUserMock).toHaveBeenCalledWith("target-9");
  });

  it("expõe o erro quando falha", async () => {
    unfollowUserMock.mockRejectedValue(new Error("rls"));

    const { result } = renderHook(() => useUnfollow("owner-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate("target-9");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useFollowUser", () => {
  it("segue e dispara a notificação de novo seguidor", async () => {
    followUserMock.mockResolvedValue(undefined);
    notifyNewFollowerMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFollowUser("user-7"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(followUserMock).toHaveBeenCalledWith("user-7");
    await waitFor(() =>
      expect(notifyNewFollowerMock).toHaveBeenCalledWith("user-7"),
    );
    expect(vi.mocked(toast.success)).toHaveBeenCalled();
  });

  it("não desfaz o follow quando a notificação falha", async () => {
    followUserMock.mockResolvedValue(undefined);
    notifyNewFollowerMock.mockRejectedValue(new Error("edge down"));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useFollowUser("user-7"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() => expect(consoleError).toHaveBeenCalled());

    consoleError.mockRestore();
  });

  it("expõe o erro quando o follow em si falha", async () => {
    followUserMock.mockRejectedValue(new Error("rls"));

    const { result } = renderHook(() => useFollowUser("user-7"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifyNewFollowerMock).not.toHaveBeenCalled();
  });
});

describe("useUnfollowUser", () => {
  it("deixa de seguir o perfil", async () => {
    unfollowUserMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUnfollowUser("user-7"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(unfollowUserMock).toHaveBeenCalledWith("user-7");
  });
});
