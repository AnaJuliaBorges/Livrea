import { formatRatingValue, getBookRatingDisplay } from "./bookRating";
import type { BookTemp } from "../types/book";

describe("formatRatingValue", () => {
  it("formata uma nota com uma casa decimal", () => {
    expect(formatRatingValue(4.2)).toBe("4.2");
    expect(formatRatingValue(4)).toBe("4.0");
  });

  it("retorna 0.0 para null ou undefined", () => {
    expect(formatRatingValue(null)).toBe("0.0");
    expect(formatRatingValue(undefined)).toBe("0.0");
  });

  it("mantém 0 como 0.0", () => {
    expect(formatRatingValue(0)).toBe("0.0");
  });
});

describe("getBookRatingDisplay", () => {
  it("prioriza local_average_rating quando presente", () => {
    const book = {
      local_average_rating: 3.2,
      global_average_rating: 4.7,
    } as BookTemp;

    expect(getBookRatingDisplay(book)).toBe("3.2");
  });

  it("usa global_average_rating quando não há média local", () => {
    const book = { global_average_rating: 4.7 } as BookTemp;

    expect(getBookRatingDisplay(book)).toBe("4.7");
  });

  it("retorna 0.0 quando não há nenhuma das duas", () => {
    expect(getBookRatingDisplay({} as BookTemp)).toBe("0.0");
  });

  it("retorna 0.0 quando o livro é undefined", () => {
    expect(getBookRatingDisplay(undefined)).toBe("0.0");
  });

  it("formata com uma casa decimal", () => {
    const book = { local_average_rating: 4 } as BookTemp;

    expect(getBookRatingDisplay(book)).toBe("4.0");
  });
});
