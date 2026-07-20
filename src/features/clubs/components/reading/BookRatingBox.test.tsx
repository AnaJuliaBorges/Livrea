import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BookRatingBox } from "./BookRatingBox";
import { getClubBookRating } from "../../services/clubReadings";
import { getClubReadingReaders } from "../../services/clubReadings";
import type { ClubReadingReader } from "../../services/clubReadings";

vi.mock("../../services/clubReadings", () => ({
  getClubBookRating: vi.fn(),
  getClubReadingReaders: vi.fn(),
}));

const getRatingMock = vi.mocked(getClubBookRating);
const getReadersMock = vi.mocked(getClubReadingReaders);

function makeReader(overrides: Partial<ClubReadingReader>): ClubReadingReader {
  return {
    userId: "user-x",
    name: "Leitor",
    avatarUrl: null,
    isAdmin: false,
    progress: 0,
    started: false,
    rating: null,
    ...overrides,
  };
}

function renderBox() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BookRatingBox
        book={undefined}
        clubId="club-1"
        bookId="book-1"
        onSelectTab={() => {}}
      />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getRatingMock.mockReset();
  getReadersMock.mockReset();
  getRatingMock.mockResolvedValue({
    clubAverage: null,
    clubCount: 0,
    myRating: null,
  });
});

describe("BookRatingBox", () => {
  it("mostra a porcentagem de participantes que terminaram o livro", async () => {
    getReadersMock.mockResolvedValue([
      makeReader({ userId: "u1", progress: 100, started: true }),
      makeReader({ userId: "u2", progress: 100, started: true }),
      makeReader({ userId: "u3", progress: 40, started: true }),
      makeReader({ userId: "u4" }),
    ]);

    renderBox();

    // 2 de 4 terminaram → 50%
    expect(await screen.findByText(/50%/)).toBeInTheDocument();
    expect(getReadersMock).toHaveBeenCalledWith("club-1", "book-1");
  });

  it("mostra 0% quando ninguém terminou ou não há leitores", async () => {
    getReadersMock.mockResolvedValue([]);

    renderBox();

    expect(await screen.findByText(/0%/)).toBeInTheDocument();
  });

  it("arredonda a porcentagem (1 de 3 → 33%)", async () => {
    getReadersMock.mockResolvedValue([
      makeReader({ userId: "u1", progress: 100, started: true }),
      makeReader({ userId: "u2", progress: 99, started: true }),
      makeReader({ userId: "u3", progress: 10, started: true }),
    ]);

    renderBox();

    expect(await screen.findByText(/33%/)).toBeInTheDocument();
  });
});
