import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { BookListCard } from "./BookListCard";
import placeholderBook from "@/assets/book-placeholder.png";

describe("BookListCard", () => {
  it("renderiza título e imagem", () => {
    render(<BookListCard title="Duna" image="capa.jpg" />);

    expect(screen.getByText("Duna")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", "capa.jpg");
  });

  it("usa o placeholder quando não há imagem", () => {
    render(<BookListCard title="Duna" />);

    expect(screen.getByRole("img")).toHaveAttribute("src", placeholderBook);
  });

  it("troca para o placeholder quando a imagem falha", () => {
    render(<BookListCard title="Duna" image="quebrada.jpg" />);

    fireEvent.error(screen.getByRole("img"));

    expect(screen.getByRole("img")).toHaveAttribute("src", placeholderBook);
  });

  it("mostra a nota quando rating é informado", () => {
    render(<BookListCard title="Duna" rating={4.5} />);

    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("mostra 0.0 quando rating é null", () => {
    render(<BookListCard title="Duna" rating={null} />);

    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("não mostra nota quando rating não é informado", () => {
    render(<BookListCard title="Duna" />);

    expect(screen.queryByText(/0\.0|\d\.\d/)).not.toBeInTheDocument();
  });

  it("renderiza como link quando 'to' é informado", () => {
    render(
      <MemoryRouter>
        <BookListCard title="Duna" to="/livros/1" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/livros/1");
  });

  it("renderiza como botão clicável quando 'onClick' é informado", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<BookListCard title="Duna" onClick={onClick} />);
    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalled();
  });

  it("renderiza como div estática quando não há 'to' nem 'onClick'", () => {
    render(<BookListCard title="Duna" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
