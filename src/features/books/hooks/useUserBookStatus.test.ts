import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUserBookStatus, useSetUserBookStatus } from "./useUserBookStatus";
import {
  getUserBookStatus,
  setUserBookStatus,
} from "../services/userBookStatus";
import { createWrapper } from "./testQueryClient";

vi.mock("../services/userBookStatus", () => ({
  getUserBookStatus: vi.fn(),
  setUserBookStatus: vi.fn(),
}));

const getStatusMock = vi.mocked(getUserBookStatus);
const setStatusMock = vi.mocked(setUserBookStatus);

beforeEach(() => {
  getStatusMock.mockReset();
  setStatusMock.mockReset();
});

describe("useUserBookStatus", () => {
  it("busca o status quando há bookId", async () => {
    getStatusMock.mockResolvedValue("reading");

    const { result } = renderHook(() => useUserBookStatus("book-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getStatusMock).toHaveBeenCalledWith("book-1");
    expect(result.current.data).toBe("reading");
  });

  it("não busca quando não há bookId", () => {
    const { result } = renderHook(() => useUserBookStatus(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useSetUserBookStatus", () => {
  it("atualiza o status otimisticamente antes da mutação resolver", async () => {
    getStatusMock.mockResolvedValue(null);
    let resolveMutation!: () => void;
    setStatusMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveMutation = resolve;
      }),
    );
    const wrapper = createWrapper();

    const { result: statusResult } = renderHook(
      () => useUserBookStatus("book-1"),
      { wrapper },
    );
    await waitFor(() => expect(statusResult.current.isSuccess).toBe(true));

    const { result: mutationResult } = renderHook(
      () => useSetUserBookStatus("book-1"),
      { wrapper },
    );

    act(() => {
      mutationResult.current.mutate("read");
    });

    await waitFor(() => expect(statusResult.current.data).toBe("read"));

    act(() => resolveMutation());
    await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));
  });

  it("reverte o status otimista quando a mutação falha", async () => {
    getStatusMock.mockResolvedValue("want_to_read");
    setStatusMock.mockRejectedValue(new Error("RLS negou"));
    const wrapper = createWrapper();

    const { result: statusResult } = renderHook(
      () => useUserBookStatus("book-1"),
      { wrapper },
    );
    await waitFor(() =>
      expect(statusResult.current.data).toBe("want_to_read"),
    );

    const { result: mutationResult } = renderHook(
      () => useSetUserBookStatus("book-1"),
      { wrapper },
    );

    act(() => {
      mutationResult.current.mutate("read");
    });

    await waitFor(() => expect(mutationResult.current.isError).toBe(true));
    expect(statusResult.current.data).toBe("want_to_read");
  });
});
