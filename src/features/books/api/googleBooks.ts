const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";

export async function searchGoogleBooks(query: string, startIndex: number = 0) {
  const params = new URLSearchParams({
    q: query,
    maxResults: "40",
    startIndex: startIndex.toString(),
    key: GOOGLE_BOOKS_API_KEY || "",
    langRestrict: "pt-br",
    country: "BR",
    page: "1",
  });

  const response = await fetch(`${GOOGLE_BOOKS_API_URL}?${params}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar livros");
  }

  const data = await response.json();

  return data.items ?? [];
}

export async function searchGoogleBooksByISBN(isbn: string) {
  try {
    const params = new URLSearchParams({
      q: `isbn:${isbn}`,
      maxResults: "1",
      key: GOOGLE_BOOKS_API_KEY || "",
    });

    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?${params}`);

    if (!response.ok) {
      throw new Error("Erro ao buscar livro por ISBN");
    }

    const data = await response.json();
    console.log("searchGoogleBooksByISBN - data:", data);

    return data.items ?? [];
  } catch (error) {
    console.error(`Erro ao buscar livro por ISBN ${isbn}:`, error);
    return [];
  }
}

export async function enrichBookFromGoogle(title: string) {
  try {
    const params = new URLSearchParams({
      q: `${title} em português`,
      maxResults: "1",
      key: GOOGLE_BOOKS_API_KEY || "",
    });

    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?${params}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const book = data.items?.[0];

    if (!book) {
      return null;
    }

    const volumeInfo = book.volumeInfo ?? {};

    return {
      title_pt: volumeInfo.title ?? "",
      averageRating: volumeInfo.averageRating,
      ratingsCount: volumeInfo.ratingsCount,
    };
  } catch (error) {
    console.error("Erro ao enriquecer livro do Google Books:", error);
    return null;
  }
}
