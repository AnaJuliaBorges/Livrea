import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getProfileGenreIds } from "../services/getProfileGenreIds";
import { useProfileGenreIds } from "./useProfileGenreIds";

vi.mock("@/lib/supabase", () => ({
  supabase: { auth: { getUser: vi.fn() } },
}));
vi.mock("../services/getProfileGenreIds", () => ({
  getProfileGenreIds: vi.fn(),
}));

const getUserMock = vi.mocked(supabase.auth.getUser);
const getProfileGenreIdsMock = vi.mocked(getProfileGenreIds);

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return createElement(QueryClientProvider, { client: queryClient }, children);
}

type GetUserResult = Awaited<ReturnType<typeof supabase.auth.getUser>>;

function mockAuthUser(id: string | null) {
  getUserMock.mockResolvedValue({
    data: { user: id ? { id } : null },
    error: null,
  } as unknown as GetUserResult);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useProfileGenreIds", () => {
  it("devolve os gêneros do usuário autenticado", async () => {
    mockAuthUser("user-1");
    getProfileGenreIdsMock.mockResolvedValue([1, 2]);

    const { result } = renderHook(() => useProfileGenreIds(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([1, 2]));
    expect(getProfileGenreIdsMock).toHaveBeenCalledWith("user-1");
    expect(result.current.isError).toBe(false);
  });

  it("distingue usuário sem gêneros de falha", async () => {
    mockAuthUser("user-1");
    getProfileGenreIdsMock.mockResolvedValue([]);

    const { result } = renderHook(() => useProfileGenreIds(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([]));
    expect(result.current.isError).toBe(false);
  });

  // O bug: getUser() não lança quando falha, devolve { user: null, error }.
  // Ignorar esse error fazia a query "ter sucesso" com null, a de gêneros
  // ficar presa em enabled:false e a tela dizer "você não tem gêneros".
  it("expõe erro quando a autenticação falha, em vez de fingir lista vazia", async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: new AuthError("sessão expirada"),
    } as unknown as GetUserResult);

    const { result } = renderHook(() => useProfileGenreIds(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    // sem usuário, a query de gêneros nem deve ser tentada
    expect(getProfileGenreIdsMock).not.toHaveBeenCalled();
  });

  it("expõe erro quando a busca de gêneros falha", async () => {
    mockAuthUser("user-1");
    getProfileGenreIdsMock.mockRejectedValue(new Error("falha na RPC"));

    const { result } = renderHook(() => useProfileGenreIds(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
