import type { ClubBookHighlight } from "../services/clubReadings";

export interface HighlightGroupParticipant {
  userId: string;
  name: string;
  avatarUrl: string | null;
  page: number;
}

export interface HighlightGroup {
  quote: string;
  page: number;
  count: number;
  participants: HighlightGroupParticipant[];
}

const MIN_CONTAINMENT_LENGTH = 15;

export function normalizeQuote(quote: string): string {
  return quote
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
