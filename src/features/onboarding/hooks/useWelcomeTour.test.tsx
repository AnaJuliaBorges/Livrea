import { renderHook, act, waitFor } from "@testing-library/react";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import type { ReactNode } from "react";

import { useWelcomeTour } from "./useWelcomeTour";
import {
  getWelcomeTourSeen,
  markWelcomeTourSeen,
} from "../services/welcomeTour";

vi.mock("../services/welcomeTour", () => ({
  getWelcomeTourSeen: vi.fn(),
  markWelcomeTourSeen: vi.fn(),
}));

const getSeenMock = vi.mocked(getWelcomeTourSeen);
const markSeenMock = vi.mocked(markWelcomeTourSeen);

// expõe também o valor atual de ?tour pra observar a limpeza da URL
function useHarness() {
  const tour = useWelcomeTour();
  const [params] = useSearchParams();
  return { ...tour, tourParam: params.get("tour") };
}

function makeWrapper(initialEntry: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>;
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  getSeenMock.mockResolvedValue(false);
  markSeenMock.mockResolvedValue(undefined);
});

describe("useWelcomeTour", () => {
  it("abre quando a conta ainda não viu", async () => {
    const { result } = renderHook(() => useHarness(), {
      wrapper: makeWrapper("/clubes"),
    });

    await waitFor(() => expect(result.current.isOpen).toBe(true));
  });

  // falha ao ler a sessão/profile: trata como já visto, o tour é enfeite e não
  // deve aparecer por engano (linha do .catch)
  it("trata falha na leitura como já visto e não abre", async () => {
    getSeenMock.mockRejectedValue(new Error("rls"));

    const { result } = renderHook(() => useHarness(), {
      wrapper: makeWrapper("/clubes"),
    });

    await waitFor(() => expect(getSeenMock).toHaveBeenCalled());
    expect(result.current.isOpen).toBe(false);
  });

  it("com ?tour=1 abre mesmo já tendo sido visto e limpa o parâmetro ao fechar", async () => {
    getSeenMock.mockResolvedValue(true);

    const { result } = renderHook(() => useHarness(), {
      wrapper: makeWrapper("/clubes?tour=1"),
    });

    await waitFor(() => expect(result.current.isOpen).toBe(true));
    expect(result.current.tourParam).toBe("1");

    act(() => {
      result.current.dismiss();
    });

    // fecha, grava a flag e some com o ?tour=1 (senão um refresh reabriria)
    expect(result.current.isOpen).toBe(false);
    expect(result.current.tourParam).toBeNull();
    expect(markSeenMock).toHaveBeenCalledTimes(1);
  });
});
