import { normalizeText } from "./text";

describe("normalizeText", () => {
  it("remove acentos e baixa a caixa", () => {
    expect(normalizeText("Poesía")).toBe("poesia");
    expect(normalizeText("FANTÁSIA Épica")).toBe("fantasia epica");
    expect(normalizeText("ção")).toBe("cao");
  });

  it("mantém texto sem acentos intacto", () => {
    expect(normalizeText("clube 123")).toBe("clube 123");
    expect(normalizeText("")).toBe("");
  });
});
