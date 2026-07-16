import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReadersSection } from "./ReadersSection";
import { getClubReadingReaders } from "../../services/getClubReadingReaders";
import type { ClubReadingReader } from "../../services/getClubReadingReaders";

vi.mock("../../services/getClubReadingReaders", () => ({
  getClubReadingReaders: vi.fn(),
}));

const getReadersMock = vi.mocked(getClubReadingReaders);

function renderSection(onBack = () => {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ReadersSection clubId="club-1" bookId="book-1" onBack={onBack} />
    </QueryClientProvider>,
  );
}

const readers: ClubReadingReader[] = [
  {
    userId: "user-1",
    name: "Bruna Lima",
    avatarUrl: null,
    isAdmin: false,
    progress: 100,
    started: true,
    rating: 4,
  },
  {
    userId: "user-2",
    name: "Ana Júlia",
    avatarUrl: null,
    isAdmin: true,
    progress: 78,
    started: true,
    rating: null,
  },
  {
    userId: "user-3",
    name: "Pedro Silva",
    avatarUrl: null,
    isAdmin: false,
    progress: 0,
    started: false,
    rating: null,
  },
];

beforeEach(() => {
  getReadersMock.mockReset();
});

describe("ReadersSection", () => {
  it("busca os leitores do livro certo e mostra a porcentagem de cada um", async () => {
    getReadersMock.mockResolvedValue(readers);

    renderSection();

    await screen.findByText("Bruna Lima");

    expect(getReadersMock).toHaveBeenCalledWith("club-1", "book-1");
    expect(screen.getByText("100% lido")).toBeInTheDocument();
    expect(screen.getByText("78% lido")).toBeInTheDocument();
  });

  it("mostra 'Não começou' pra quem não iniciou a leitura", async () => {
    getReadersMock.mockResolvedValue(readers);

    renderSection();

    await screen.findByText("Pedro Silva");

    expect(screen.getByText("Não começou")).toBeInTheDocument();
    expect(screen.queryByText("0% lido")).not.toBeInTheDocument();
  });

  it("mostra a nota só de quem avaliou e o badge de admin", async () => {
    getReadersMock.mockResolvedValue(readers);

    renderSection();

    await screen.findByText("Bruna Lima");

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();
    expect(screen.getAllByText("Membro")).toHaveLength(2);
  });

  it("mostra o estado de carregamento", () => {
    getReadersMock.mockReturnValue(new Promise(() => {}));

    renderSection();

    expect(screen.getByText("Carregando leitores...")).toBeInTheDocument();
  });
});
