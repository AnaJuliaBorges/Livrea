import type { ClubBookHighlight } from "../services/getClubBookHighlights";

export interface HighlightGroupParticipant {
  userId: string;
  name: string;
  avatarUrl: string | null;
  // página em que ESTE participante marcou (varia por edição)
  page: number;
}

export interface HighlightGroup {
  // versão mais completa (longa) da citação dentro do grupo
  quote: string;
  // página da versão exibida
  page: number;
  count: number;
  participants: HighlightGroupParticipant[];
}

// Citações muito curtas só agrupam por igualdade — containment de um trecho
// minúsculo ("amor") fundiria citações que não têm nada a ver.
const MIN_CONTAINMENT_LENGTH = 15;

// minúsculas, sem acento, sem pontuação, espaços colapsados — tolera
// diferenças de aspas, reticências e digitação entre edições
export function normalizeQuote(quote: string): string {
  return quote
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Agrupa destaques cuja citação é igual OU está contida em outra (edições
// diferentes paginam diferente, então a página não serve de chave).
// Estratégia: processa da citação mais longa pra mais curta; cada citação
// entra no primeiro grupo cujo representante a contém, senão vira grupo
// novo. Assim "A B C" agrupa "A B" e "B C" mesmo que estes não se
// contenham entre si.
export function groupHighlights(
  highlights: ClubBookHighlight[],
): HighlightGroup[] {
  const sorted = [...highlights]
    .map((highlight) => ({
      highlight,
      norm: normalizeQuote(highlight.quote),
    }))
    .filter(({ norm }) => norm.length > 0)
    .sort((a, b) => b.norm.length - a.norm.length);

  const groups: {
    representative: ClubBookHighlight;
    norm: string;
    participants: HighlightGroupParticipant[];
  }[] = [];

  for (const { highlight, norm } of sorted) {
    const group = groups.find(
      (g) =>
        g.norm === norm ||
        (norm.length >= MIN_CONTAINMENT_LENGTH && g.norm.includes(norm)),
    );

    if (!group) {
      groups.push({
        representative: highlight,
        norm,
        participants: [
          {
            userId: highlight.userId,
            name: highlight.name,
            avatarUrl: highlight.avatarUrl,
            page: highlight.page,
          },
        ],
      });
      continue;
    }

    // mesmo usuário marcando o mesmo trecho de novo não conta duas vezes
    if (!group.participants.some((p) => p.userId === highlight.userId)) {
      group.participants.push({
        userId: highlight.userId,
        name: highlight.name,
        avatarUrl: highlight.avatarUrl,
        page: highlight.page,
      });
    }
  }

  return groups
    .map((group) => ({
      quote: group.representative.quote,
      page: group.representative.page,
      count: group.participants.length,
      participants: group.participants,
    }))
    .sort((a, b) => b.count - a.count || a.page - b.page);
}
