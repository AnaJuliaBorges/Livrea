import { renderHook, waitFor, act } from "@testing-library/react";
import { useFeed } from "./useFeed";
import { getFeed, type FeedEvent } from "../services/getFeed";
import { createWrapper } from "./testQueryClient";

// mantém FEED_PAGE_SIZE real (a lógica de paginação depende dele)
vi.mock("../services/getFeed", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/getFeed")>();
  return { ...actual, getFeed: vi.fn() };
});

const getFeedMock = vi.mocked(getFeed);

function startedEvent(i: number): FeedEvent {
  return {
    id: `started_book:u:${i}`,
    type: "started_book",
    createdAt: "2026-07-20T10:00:00Z",
    actor: { id: "u", name: "Ana", avatarUrl: null },
    book: { id: `b${i}`, title: "Livro", image: null },
  };
}

const fullPage = Array.from({ length: 20 }, (_, i) => startedEvent(i));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useFeed", () => {
  it("busca a primeira página com offset 0", async () => {
    getFeedMock.mockResolvedValue([startedEvent(1)]);

    const { result } = renderHook(() => useFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getFeedMock).toHaveBeenCalledWith(0);
    expect(result.current.data?.pages[0]).toHaveLength(1);
  });

  it("não tem próxima página quando a última vem incompleta", async () => {
    getFeedMock.mockResolvedValue([startedEvent(1)]);

    const { result } = renderHook(() => useFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("busca a próxima página com o offset acumulado quando a página vem cheia", async () => {
    getFeedMock.mockResolvedValue(fullPage);

    const { result } = renderHook(() => useFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    act(() => {
      result.current.fetchNextPage();
    });

    await waitFor(() => expect(getFeedMock).toHaveBeenCalledWith(20));
  });

  it("expõe o erro quando a busca falha", async () => {
    getFeedMock.mockRejectedValue(new Error("rls"));

    const { result } = renderHook(() => useFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
