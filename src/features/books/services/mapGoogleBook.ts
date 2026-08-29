import type { Book } from "../types/book";

export type GoogleBooksItem = {
  volumeInfo?: {
    industryIdentifiers?: { type: string; identifier: string }[];
    title?: string;
    subtitle?: string;
    authors?: string[];
    description?: string;
    pageCount?: number;
    categories?: string[];
    mainCategory?: string;
    publishedDate?: string;
    publisher?: string;
    language?: string;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
      medium?: string;
      large?: string;
    };
    averageRating?: number;
    ratingsCount?: number;
  };
  id: string;
};

const IGNORED_CATEGORIES = new Set(["general"]);

function normalizeCategories(categories: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const category of categories) {
    for (const part of category.split("/")) {
      const name = part.trim();
      const key = name.toLowerCase();

      if (name && !IGNORED_CATEGORIES.has(key) && !seen.has(key)) {
        seen.add(key);
        result.push(name);
      }
    }
  }

  return result;
}

export function mapGoogleBook(item: GoogleBooksItem): Book {
  const volumeInfo = item.volumeInfo ?? {};
  const identifiers = volumeInfo.industryIdentifiers ?? [];
  const isbn = identifiers.find(
    (id: { type: string; identifier: string }) => id.type === "ISBN_13",
  )?.identifier;
  const categories = normalizeCategories(volumeInfo.categories ?? []);
  const imageLinks = volumeInfo.imageLinks ?? {};

  const mainGenre = volumeInfo.mainCategory ?? categories[0];

  return {
    google_id: item.id,
    info: {
      isbn,
      title: volumeInfo.title ?? "Sem título",
      subtitle: volumeInfo.subtitle ?? "",
      authors: volumeInfo.authors ?? [],
      summary: volumeInfo.description,
      pageCount: volumeInfo.pageCount,
    },
    genre: {
      main: mainGenre,
      secondary: categories.filter((category) => category !== mainGenre),
    },
    publisher: {
      publisherDate: volumeInfo.publishedDate ?? "",
      publisher: volumeInfo.publisher ?? "",
    },
    image: {
      smallThumbnail: imageLinks.smallThumbnail,
      thumbnail: imageLinks.thumbnail,
      medium: imageLinks.medium,
      large: imageLinks.large,
    },
    averageRating: volumeInfo.averageRating,
    ratingsCount: volumeInfo.ratingsCount,
  };
}
