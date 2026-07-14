import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BookImage } from "./BookImage";
import placeholderBook from "../../../assets/book-placeholder.png";

describe("BookImage", () => {
  it("usa image_medium quando disponível", () => {
    render(
      <BookImage
        book={{
          title_original: "Duna",
          image_medium: "medium.jpg",
          image_thumbnail: "thumb.jpg",
          image_large: "large.jpg",
        }}
      />,
    );

    expect(screen.getByRole("img")).toHaveAttribute("src", "medium.jpg");
  });

  it("cai para image_thumbnail quando não há image_medium", () => {
    render(
      <BookImage
        book={{ title_original: "Duna", image_thumbnail: "thumb.jpg" }}
      />,
    );

    expect(screen.getByRole("img")).toHaveAttribute("src", "thumb.jpg");
  });

  it("cai para image_large quando faltam medium e thumbnail", () => {
    render(
      <BookImage book={{ title_original: "Duna", image_large: "large.jpg" }} />,
    );

    expect(screen.getByRole("img")).toHaveAttribute("src", "large.jpg");
  });

  it("usa o placeholder quando não há livro nem imagens", () => {
    render(<BookImage />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", placeholderBook);
    expect(img).toHaveAttribute("alt", "Capa do livro");
  });

  it("troca para o placeholder quando a imagem falha ao carregar", () => {
    render(
      <BookImage
        book={{ title_original: "Duna", image_medium: "quebrada.jpg" }}
      />,
    );

    const img = screen.getByRole("img");
    fireEvent.error(img);

    expect(img).toHaveAttribute("src", placeholderBook);
  });
});
