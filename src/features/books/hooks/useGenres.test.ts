import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGenres } from "./useGenres";
import { getGenres, type Genre } from "../services/getGenres";
import { createWrapper } from "./testQueryClient";

vi.mock("../services/getGenres", () => ({
  getGenres: vi.fn(),
}));

const getGenresMock = vi.mocked(getGenres);

beforeEach(() => {
  getGenresMock.mockReset();
});

describe("useGenres", () => {
  it("busca a lista de gêneros", async () => {
    const genres: Genre[] = [
      { id: 1, name: "Fantasia", google_category: ["Fiction/Fantasy"] },
    ];
    getGenresMock.mockResolvedValue(genres);

    const { result } = renderHook(() => useGenres(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(genres);
  });
});
