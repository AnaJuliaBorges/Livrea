import { describe, it, expect } from "vitest";
import { mapGoogleBook, type GoogleBooksItem } from "./mapGoogleBook";

describe("mapGoogleBook", () => {
  it("mapeia um item completo do Google Books", () => {
    const item: GoogleBooksItem = {
      id: "vol-1",
      volumeInfo: {
        industryIdentifiers: [
          { type: "ISBN_10", identifier: "123" },
          { type: "ISBN_13", identifier: "9788528623253" },
        ],
        title: "Duna",
        subtitle: "Livro 1",
        authors: ["Frank Herbert"],
        description: "Sinopse",
        pageCount: 500,
        categories: ["Fiction/Science Fiction", "Fiction/Adventure"],
        publishedDate: "1965",
        publisher: "Aleph",
        imageLinks: {
          smallThumbnail: "small.jpg",
          thumbnail: "thumb.jpg",
          medium: "medium.jpg",
          large: "large.jpg",
        },
        averageRating: 4.8,
        ratingsCount: 500,
      },
    };

    expect(mapGoogleBook(item)).toEqual({
      google_id: "vol-1",
      info: {
        isbn: "9788528623253",
        title: "Duna",
        subtitle: "Livro 1",
        authors: ["Frank Herbert"],
        summary: "Sinopse",
        pageCount: 500,
      },
      genre: {
        main: "Fiction",
        secondary: ["Science Fiction", "Adventure"],
      },
      publisher: {
        publisherDate: "1965",
        publisher: "Aleph",
      },
      image: {
        smallThumbnail: "small.jpg",
        thumbnail: "thumb.jpg",
        medium: "medium.jpg",
        large: "large.jpg",
      },
      averageRating: 4.8,
      ratingsCount: 500,
    });
  });

  it("usa valores padrão quando volumeInfo está ausente", () => {
    const item: GoogleBooksItem = { id: "vol-2" };

    const result = mapGoogleBook(item);

    expect(result.info.title).toBe("Sem título");
    expect(result.info.subtitle).toBe("");
    expect(result.info.authors).toEqual([]);
    expect(result.info.isbn).toBeUndefined();
    expect(result.genre).toEqual({ main: undefined, secondary: [] });
    expect(result.publisher).toEqual({ publisherDate: "", publisher: "" });
  });

  it("ignora a categoria 'General' e deduplica categorias repetidas", () => {
    const item: GoogleBooksItem = {
      id: "vol-3",
      volumeInfo: {
        categories: [
          "Fantasy / General",
          "fantasy",
          "Fiction/Fantasy/Epic",
        ],
      },
    };

    const result = mapGoogleBook(item);

    expect(result.genre.main).toBe("Fantasy");
    expect(result.genre.secondary).toEqual(["Fiction", "Epic"]);
  });

  it("usa mainCategory quando presente em vez da primeira categoria", () => {
    const item: GoogleBooksItem = {
      id: "vol-4",
      volumeInfo: {
        mainCategory: "Ficção Científica",
        categories: ["Fiction/Fantasy"],
      },
    };

    const result = mapGoogleBook(item);

    expect(result.genre.main).toBe("Ficção Científica");
    expect(result.genre.secondary).toEqual(["Fiction", "Fantasy"]);
  });
});
