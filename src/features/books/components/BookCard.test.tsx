import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BookCard } from "./BookCard";
import type { Book } from "../types/book";

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    google_id: "1",
    info: { title: "Duna", subtitle: "", authors: ["Frank Herbert"] },
    genre: {},
    publisher: { publisher: "", publisherDate: "" },
    image: { thumbnail: "thumb.jpg" },
    ...overrides,
  };
}

describe("BookCard", () => {
  it("mostra a capa e o título do livro", () => {
    render(<BookCard book={makeBook()} selected={false} onToggle={vi.fn()} />);

    expect(screen.getByRole("img", { name: "Duna" })).toHaveAttribute(
      "src",
      "thumb.jpg",
    );
    expect(screen.getByText("Duna")).toBeInTheDocument();
  });

  it("mostra placeholder de 'Sem imagem' quando não há capa", () => {
    render(
      <BookCard
        book={makeBook({ image: {} })}
        selected={false}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText("Sem imagem")).toBeInTheDocument();
  });

  it("mostra o indicador de seleção quando selecionado", () => {
    render(<BookCard book={makeBook()} selected onToggle={vi.fn()} />);

    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("chama onToggle com o livro ao clicar", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const book = makeBook();

    render(<BookCard book={book} selected={false} onToggle={onToggle} />);
    await user.click(screen.getByRole("button"));

    expect(onToggle).toHaveBeenCalledWith(book);
  });
});
