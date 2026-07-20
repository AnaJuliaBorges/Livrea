import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReviewCard } from "./ReviewCard";
import type { BookReview } from "../types/book";
import { formatDate } from "@/lib/dates";

function makeReview(overrides: Partial<BookReview> = {}): BookReview {
  return {
    id: "1",
    user: { id: "1", name: "Ana Julia Borges", photo: "" },
    created_at: "2026-01-15T00:00:00",
    rating: 4.5,
    comment: "Livro incrível!",
    likes: 0,
    ...overrides,
  };
}

describe("ReviewCard", () => {
  it("mostra nome, comentário, nota e data formatada", () => {
    const review = makeReview();
    render(<ReviewCard review={review} />);

    expect(screen.getByText("Ana Julia Borges")).toBeInTheDocument();
    expect(screen.getByText("Livro incrível!")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(
      screen.getByText(formatDate(new Date(review.created_at))),
    ).toBeInTheDocument();
  });

  it("mostra 0.0 quando não há nota", () => {
    render(
      <ReviewCard review={makeReview({ rating: undefined as unknown as number })} />,
    );

    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("monta as iniciais a partir do nome do usuário", () => {
    render(
      <ReviewCard review={makeReview({ user: { id: "1", name: "Ana Julia Borges", photo: "" } })} />,
    );

    expect(screen.getByText("AJ")).toBeInTheDocument();
  });

  it("monta iniciais de nome com uma única palavra", () => {
    render(
      <ReviewCard review={makeReview({ user: { id: "1", name: "Ana", photo: "" } })} />,
    );

    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
