import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FeedItem } from "./FeedItem";
import type { FeedEvent } from "../services/getFeed";

const actor = { id: "u1", name: "Ana", avatarUrl: null };
const book = { id: "b1", title: "Torto Arado", image: "capa.jpg" };

function renderItem(event: FeedEvent) {
  return render(
    <MemoryRouter>
      <FeedItem event={event} />
    </MemoryRouter>,
  );
}

describe("FeedItem", () => {
  it("evento de começou a ler: frase + links do perfil e do livro", () => {
    renderItem({
      id: "started_book:u1:b1",
      type: "started_book",
      createdAt: new Date().toISOString(),
      actor,
      book,
    });

    expect(screen.getByText(/começou a ler/i)).toBeInTheDocument();
    expect(screen.getByText("Ana")).toHaveAttribute("href", "/perfil/u1");
    expect(screen.getByText("Torto Arado")).toHaveAttribute("href", "/livros/b1");
  });

  it("evento de terminou de ler", () => {
    renderItem({
      id: "finished_book:u1:b1",
      type: "finished_book",
      createdAt: new Date().toISOString(),
      actor,
      book,
    });

    expect(screen.getByText(/terminou de ler/i)).toBeInTheDocument();
  });

  it("evento de resenha mostra a nota e o texto", () => {
    renderItem({
      id: "reviewed_book:u1:b1",
      type: "reviewed_book",
      createdAt: new Date().toISOString(),
      actor,
      book,
      rating: 5,
      review: "Recomendo demais!",
    });

    expect(screen.getByText(/avaliou/i)).toBeInTheDocument();
    expect(screen.getByText(/nota 5/)).toBeInTheDocument();
    expect(screen.getByText(/Recomendo demais!/)).toBeInTheDocument();
  });

  it("evento de entrou no clube: link do clube", () => {
    renderItem({
      id: "joined_club:u1:c1",
      type: "joined_club",
      createdAt: new Date().toISOString(),
      actor,
      club: { id: "c1", name: "Leituras de Sábado", coverUrl: null },
    });

    expect(screen.getByText(/entrou no clube/i)).toBeInTheDocument();
    expect(screen.getByText("Leituras de Sábado")).toHaveAttribute(
      "href",
      "/clubes/c1",
    );
  });
});
