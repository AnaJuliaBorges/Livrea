import { groupHighlights, normalizeQuote } from "./groupHighlights";
import type { ClubBookHighlight } from "../services/clubReadings";

function makeHighlight(
  overrides: Partial<ClubBookHighlight>,
): ClubBookHighlight {
  return {
    userId: "user-x",
    name: "Leitor",
    avatarUrl: null,
    page: 1,
    quote: "",
    ...overrides,
  };
}

describe("normalizeQuote", () => {
  it("normaliza caixa, acentos, pontuação e espaços", () => {
    expect(normalizeQuote('  "Era uma VEZ, um sonho..."  ')).toBe(
      "era uma vez um sonho",
    );
    expect(normalizeQuote("coração — é isso")).toBe("coracao e isso");
  });
});

describe("groupHighlights", () => {
  it("agrupa citações iguais mesmo com pontuação/caixa diferentes", () => {
    const groups = groupHighlights([
      makeHighlight({
        userId: "u1",
        name: "Ana",
        page: 42,
        quote: "O amor é a ponte entre você e tudo.",
      }),
      makeHighlight({
        userId: "u2",
        name: "Bruna",
        page: 57,
        quote: '"o amor é a ponte entre você e tudo"',
      }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].count).toBe(2);
    expect(groups[0].participants.map((p) => p.userId)).toEqual(["u1", "u2"]);
  });

  it("agrupa citação contida na outra e exibe a versão mais longa", () => {
    const groups = groupHighlights([
      makeHighlight({
        userId: "u1",
        page: 10,
        quote: "a ponte entre você e tudo",
      }),
      makeHighlight({
        userId: "u2",
        page: 12,
        quote: "O amor é a ponte entre você e tudo o que existe.",
      }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].quote).toBe(
      "O amor é a ponte entre você e tudo o que existe.",
    );
    expect(groups[0].page).toBe(12);
    expect(groups[0].count).toBe(2);
  });

  it("guarda a página de cada participante (edições diferentes)", () => {
    const groups = groupHighlights([
      makeHighlight({
        userId: "u1",
        page: 42,
        quote: "O amor é a ponte entre você e tudo.",
      }),
      makeHighlight({
        userId: "u2",
        page: 57,
        quote: "O amor é a ponte entre você e tudo.",
      }),
    ]);

    expect(groups[0].participants).toEqual([
      expect.objectContaining({ userId: "u1", page: 42 }),
      expect.objectContaining({ userId: "u2", page: 57 }),
    ]);
  });

  it("não agrupa por containment citações muito curtas", () => {
    const groups = groupHighlights([
      makeHighlight({ userId: "u1", quote: "O amor é a ponte entre você e tudo." }),
      makeHighlight({ userId: "u2", quote: "amor" }),
    ]);

    expect(groups).toHaveLength(2);
  });

  it("agrupa trechos que não se contêm entre si via o representante maior", () => {
    const groups = groupHighlights([
      makeHighlight({ userId: "u1", quote: "no fim, todos os rios correm para o mesmo mar" }),
      makeHighlight({ userId: "u2", quote: "no fim, todos os rios correm" }),
      makeHighlight({ userId: "u3", quote: "os rios correm para o mesmo mar" }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].count).toBe(3);
  });

  it("mesmo usuário marcando o mesmo trecho duas vezes conta uma", () => {
    const groups = groupHighlights([
      makeHighlight({ userId: "u1", page: 10, quote: "uma frase marcante do livro" }),
      makeHighlight({ userId: "u1", page: 11, quote: "uma frase marcante do livro" }),
    ]);

    expect(groups[0].count).toBe(1);
  });

  it("ordena por quantidade de marcações e desempata por página", () => {
    const groups = groupHighlights([
      makeHighlight({ userId: "u1", page: 90, quote: "citação solitária no fim do livro" }),
      makeHighlight({ userId: "u1", page: 5, quote: "citação popular do começo do livro" }),
      makeHighlight({ userId: "u2", page: 7, quote: "citação popular do começo do livro" }),
    ]);

    expect(groups.map((g) => g.quote)).toEqual([
      "citação popular do começo do livro",
      "citação solitária no fim do livro",
    ]);
  });

  it("ignora citações vazias e lida com lista vazia", () => {
    expect(groupHighlights([])).toEqual([]);
    expect(
      groupHighlights([makeHighlight({ userId: "u1", quote: "   " })]),
    ).toEqual([]);
  });
});
