import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Feed from "./Feed";
import { useFeed } from "../hooks/useFeed";
import type { FeedEvent } from "../services/getFeed";

vi.mock("../hooks/useFeed", () => ({
  useFeed: vi.fn(),
}));

const useFeedMock = vi.mocked(useFeed);

function feedState(overrides: Partial<ReturnType<typeof useFeed>>) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    ...overrides,
  } as unknown as ReturnType<typeof useFeed>;
}

function pages(events: FeedEvent[]) {
  return { pages: [events], pageParams: [0] } as unknown as ReturnType<
    typeof useFeed
  >["data"];
}

const sampleEvent: FeedEvent = {
  id: "started_book:u1:b1",
  type: "started_book",
  createdAt: new Date().toISOString(),
  actor: { id: "u1", name: "Ana", avatarUrl: null },
  book: { id: "b1", title: "Torto Arado", image: null },
};

function renderFeed() {
  return render(
    <MemoryRouter>
      <Feed />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Feed", () => {
  it("mostra o estado de carregando", () => {
    useFeedMock.mockReturnValue(feedState({ isLoading: true }));

    renderFeed();

    expect(screen.getByText(/Carregando o feed/)).toBeInTheDocument();
  });

  it("mostra o estado de erro", () => {
    useFeedMock.mockReturnValue(feedState({ isError: true }));

    renderFeed();

    expect(screen.getByText(/Não foi possível carregar o feed/)).toBeInTheDocument();
  });

  it("mostra o empty state com link para explorar clubes", () => {
    useFeedMock.mockReturnValue(feedState({ data: pages([]) }));

    renderFeed();

    expect(screen.getByText(/Nada por aqui ainda/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explorar clubes/ })).toHaveAttribute(
      "href",
      "/clubes",
    );
  });

  it("renderiza os eventos do feed", () => {
    useFeedMock.mockReturnValue(feedState({ data: pages([sampleEvent]) }));

    renderFeed();

    expect(screen.getByText(/começou a ler/i)).toBeInTheDocument();
    expect(screen.getByText("Torto Arado")).toBeInTheDocument();
  });

  it("mostra 'Carregar mais' e dispara fetchNextPage ao clicar", async () => {
    const user = userEvent.setup();
    const fetchNextPage = vi.fn();
    useFeedMock.mockReturnValue(
      feedState({ data: pages([sampleEvent]), hasNextPage: true, fetchNextPage }),
    );

    renderFeed();

    await user.click(screen.getByRole("button", { name: /Carregar mais/ }));

    expect(fetchNextPage).toHaveBeenCalled();
  });
});
