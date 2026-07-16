import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReviewsSection } from "./ReviewsSection";
import { getClubBookReviews } from "../../services/getClubBookReviews";
import type { ClubBookReview } from "../../services/getClubBookReviews";

vi.mock("../../services/getClubBookReviews", () => ({
  getClubBookReviews: vi.fn(),
}));

const getReviewsMock = vi.mocked(getClubBookReviews);

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ReviewsSection clubId="club-1" bookId="book-1" onBack={() => {}} />
    </QueryClientProvider>,
  );
}

const reviews: ClubBookReview[] = [
  {
    userId: "user-1",
    name: "Ana Júlia",
    avatarUrl: null,
    rating: 5,
    review: "Livro incrível, li em dois dias.",
  },
  {
    userId: "user-2",
    name: "Bruna",
    avatarUrl: null,
    rating: null,
    review: "Gostei, mas o final é corrido.",
  },
];

beforeEach(() => {
  getReviewsMock.mockReset();
});

describe("ReviewsSection", () => {
  it("busca as resenhas do livro certo e mostra nome, nota e texto", async () => {
    getReviewsMock.mockResolvedValue(reviews);

    renderSection();

    await screen.findByText("Ana Júlia");

    expect(getReviewsMock).toHaveBeenCalledWith("club-1", "book-1");
    expect(
      screen.getByText("Livro incrível, li em dois dias."),
    ).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(
      screen.getByText("Gostei, mas o final é corrido."),
    ).toBeInTheDocument();
  });

  it("não mostra estrela pra resenha sem nota", async () => {
    getReviewsMock.mockResolvedValue([reviews[1]]);

    renderSection();

    await screen.findByText("Bruna");

    expect(screen.queryByText("null")).not.toBeInTheDocument();
    // só o texto da resenha, sem bloco de nota
    expect(document.querySelectorAll("svg.lucide-star")).toHaveLength(0);
  });

  it("mostra aviso quando ninguém resenhou ainda", async () => {
    getReviewsMock.mockResolvedValue([]);

    renderSection();

    expect(
      await screen.findByText("Nenhum participante resenhou este livro ainda."),
    ).toBeInTheDocument();
  });

  it("mostra o estado de carregamento", () => {
    getReviewsMock.mockReturnValue(new Promise(() => {}));

    renderSection();

    expect(screen.getByText("Carregando resenhas...")).toBeInTheDocument();
  });
});
