import { describe, it, expect } from "vitest";
import { formatDate, formatDateString, extractYear } from "./formatDate";

describe("formatDate", () => {
  it("formata uma data no padrão pt-BR", () => {
    expect(formatDate(new Date(2024, 3, 26))).toBe("26/04/2024");
  });
});

describe("formatDateString", () => {
  it("formata uma string de data ISO no padrão pt-BR", () => {
    expect(formatDateString("2024-04-26T00:00:00")).toBe("26/04/2024");
  });
});

describe("extractYear", () => {
  it("extrai o ano de uma data completa", () => {
    expect(extractYear("2018-04-26")).toBe("2018");
  });

  it("extrai o ano de uma string só com ano", () => {
    expect(extractYear("2018")).toBe("2018");
  });

  it("extrai o ano de uma string com mês por extenso", () => {
    expect(extractYear("April 2018")).toBe("2018");
  });

  it("retorna a string original quando não há ano", () => {
    expect(extractYear("sem data")).toBe("sem data");
  });
});
