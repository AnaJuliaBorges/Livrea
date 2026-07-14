import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchIsbndbBookData } from "./fetchIsbndbBookData";
import { getIsbndbBookByIsbn } from "../api/isbndb";

vi.mock("../api/isbndb", () => ({
  getIsbndbBookByIsbn: vi.fn(),
}));

const getByIsbnMock = vi.mocked(getIsbndbBookByIsbn);

beforeEach(() => {
  getByIsbnMock.mockReset();
});

describe("fetchIsbndbBookData", () => {
  it("mapeia o livro retornado pela ISBNDB", async () => {
    getByIsbnMock.mockResolvedValue({
      isbn: "1",
      isbn13: "9788528623253",
      title: "Anjos Partidos",
    });

    const result = await fetchIsbndbBookData("9788528623253");

    expect(getByIsbnMock).toHaveBeenCalledWith("9788528623253");
    expect(result?.info.title).toBe("Anjos Partidos");
  });

  it("retorna null quando a ISBNDB não encontra o livro", async () => {
    getByIsbnMock.mockResolvedValue(null);

    expect(await fetchIsbndbBookData("000")).toBeNull();
  });
});
