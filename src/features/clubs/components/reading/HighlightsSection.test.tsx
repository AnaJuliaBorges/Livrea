import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HighlightsSection } from "./HighlightsSection";
import { getClubBookHighlights } from "../../services/getClubBookHighlights";
import type { ClubBookHighlight } from "../../services/getClubBookHighlights";

vi.mock("../../services/getClubBookHighlights", () => ({
  getClubBookHighlights: vi.fn(),
}));

const getHighlightsMock = vi.mocked(getClubBookHighlights);

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <HighlightsSection clubId="club-1" bookId="book-1" onBack={() => {}} />
    </QueryClientProvider>,
  );
}

// mesma citação em edições diferentes (páginas diferentes) + uma solitária
const highlights: ClubBookHighlight[] = [
  {
    userId: "u1",
    name: "Ana Júlia",
    avatarUrl: null,
    page: 42,
    quote: "O amor é a ponte entre você e tudo.",
  },
  {
    userId: "u2",
    name: "Bruna",
    avatarUrl: null,
    page: 57,
    quote: '"o amor é a ponte entre você e tudo"',
  },
  {
    userId: "u3",
    name: "Pedro",
    avatarUrl: null,
    page: 90,
    quote: "Uma frase que só o Pedro marcou no fim.",
  },
];

beforeEach(() => {
  getHighlightsMock.mockReset();
});

describe("HighlightsSection", () => {
  it("agrupa citações equivalentes e mostra a contagem de marcações", async () => {
    getHighlightsMock.mockResolvedValue(highlights);

    renderSection();

    await screen.findByText(/O amor é a ponte entre você e tudo\./);

    expect(getHighlightsMock).toHaveBeenCalledWith("club-1", "book-1");
    expect(screen.getByText("2 marcações")).toBeInTheDocument();
    expect(screen.getByText("1 marcação")).toBeInTheDocument();
  });

  it("abre o modal com os participantes e a página de cada um ao clicar", async () => {
    getHighlightsMock.mockResolvedValue(highlights);
    const user = userEvent.setup();

    renderSection();

    await user.click(
      await screen.findByText(/O amor é a ponte entre você e tudo\./),
    );

    expect(screen.getByText("Quem marcou esta citação")).toBeInTheDocument();
    expect(screen.getByText("Ana Júlia")).toBeInTheDocument();
    expect(screen.getByText("Bruna")).toBeInTheDocument();
    // "Página 42" aparece no card da lista (representante) e no modal
    expect(screen.getAllByText("Página 42")).toHaveLength(2);
    expect(screen.getByText("Página 57")).toBeInTheDocument();
    expect(screen.queryByText("Pedro")).not.toBeInTheDocument();

    await user.click(screen.getByText("Fechar"));

    expect(
      screen.queryByText("Quem marcou esta citação"),
    ).not.toBeInTheDocument();
  });

  it("mostra aviso quando não há destaques", async () => {
    getHighlightsMock.mockResolvedValue([]);

    renderSection();

    expect(
      await screen.findByText(
        "Nenhum participante destacou trechos deste livro ainda.",
      ),
    ).toBeInTheDocument();
  });

  it("mostra o estado de carregamento", () => {
    getHighlightsMock.mockReturnValue(new Promise(() => {}));

    renderSection();

    expect(screen.getByText("Carregando destaques...")).toBeInTheDocument();
  });
});
