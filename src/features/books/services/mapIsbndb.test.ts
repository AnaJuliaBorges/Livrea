import { describe, it, expect } from "vitest";
import { mapIsbndb } from "./mapIsbndb";
import type { IsbndbBook } from "../types/isbndb";

describe("mapIsbndb", () => {
  it("mapeia um item completo da ISBNDB", () => {
    const item: IsbndbBook = {
      isbn: "8528623253",
      isbn13: "9788528623253",
      title: "Anjos Partidos",
      authors: ["Richard Morgan"],
      publisher: "Bertrand",
      image: "capa.jpg",
      pages: 490,
      date_published: "2018-04-26",
      synopsis: "<p>Sinopse</p>",
      subjects: ["Science Fiction"],
    };

    expect(mapIsbndb(item)).toEqual({
      google_id: "9788528623253",
      info: {
        isbn: "9788528623253",
        title: "Anjos Partidos",
        subtitle: "",
        authors: ["Richard Morgan"],
        pageCount: 490,
        summary: "<p>Sinopse</p>",
      },
      genre: {
        main: undefined,
        secondary: ["Science Fiction"],
      },
      publisher: {
        publisherDate: "2018-04-26",
        publisher: "Bertrand",
      },
      image: {
        smallThumbnail: "capa.jpg",
        thumbnail: "capa.jpg",
        medium: undefined,
        large: undefined,
      },
      averageRating: undefined,
      ratingsCount: undefined,
    });
  });

  it("usa isbn10 quando isbn13 está ausente", () => {
    const item: IsbndbBook = { isbn: "8528623253", isbn13: "", title: "Livro" };

    expect(mapIsbndb(item).google_id).toBe("8528623253");
  });

  it("usa author singular quando authors está ausente", () => {
    const item: IsbndbBook = {
      isbn: "1",
      isbn13: "1",
      title: "Livro",
      author: "Autor Único",
    };

    expect(mapIsbndb(item).info.authors).toEqual(["Autor Único"]);
  });

  it("usa array vazio de autores e 'Sem título' quando ambos ausentes", () => {
    const item: IsbndbBook = { isbn: "1", isbn13: "1", title: "" };

    const result = mapIsbndb(item);

    expect(result.info.authors).toEqual([]);
    expect(result.info.title).toBe("Sem título");
  });

  it("usa array vazio quando subjects está ausente", () => {
    const item: IsbndbBook = { isbn: "1", isbn13: "1", title: "Livro" };

    expect(mapIsbndb(item).genre.secondary).toEqual([]);
  });
});
