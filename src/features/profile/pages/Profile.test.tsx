import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Profile from "./Profile";
import { useMyProfile } from "../hooks/useMyProfile";
import type { UserProfile } from "../dtos";

vi.mock("../hooks/useMyProfile");

const useMyProfileMock = vi.mocked(useMyProfile);

function mockQueryState(state: {
  data?: UserProfile;
  isLoading?: boolean;
  isError?: boolean;
}) {
  useMyProfileMock.mockReturnValue({
    data: state.data,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
  } as ReturnType<typeof useMyProfile>);
}

const profile: UserProfile = {
  id: "user-1",
  name: "Ana Julia Borges",
  bio: "Leitora voraz",
  avatarUrl: null,
  city: "Campinas",
  state: "SP",
  stateId: 26,
  cityId: 3509502,
  clubs: [
    {
      id: "club-1",
      name: "Clube da Fantasia",
      city: "Campinas",
      state: "SP",
      coverUrl: null,
      genres: ["Fantasia"],
      isAdmin: true,
      participants: 12,
      participantLimit: 20,
    },
  ],
  library: {
    read: [
      {
        id: "book-1",
        title: "O Hobbit",
        rating: 4.5,
        imageThumbnail: null,
        imageMedium: null,
        imageLarge: null,
      },
      {
        id: "book-2",
        title: "Duna",
        rating: null,
        imageThumbnail: null,
        imageMedium: null,
        imageLarge: null,
      },
    ],
    reading: [
      {
        id: "book-3",
        title: "O Nome do Vento",
        rating: null,
        imageThumbnail: null,
        imageMedium: null,
        imageLarge: null,
      },
    ],
    wantToRead: [],
  },
};

function renderProfile() {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>,
  );
}

describe("Profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra o estado de carregamento", () => {
    mockQueryState({ isLoading: true });

    renderProfile();

    expect(screen.getByText("Carregando perfil...")).toBeInTheDocument();
  });

  it("mostra mensagem de erro quando a query falha", () => {
    mockQueryState({ isError: true });

    renderProfile();

    expect(
      screen.getByText("Não foi possível carregar o perfil. Tente novamente."),
    ).toBeInTheDocument();
  });

  it("renderiza nome, bio e localização do usuário", () => {
    mockQueryState({ data: profile });

    renderProfile();

    expect(screen.getByText("Ana Julia Borges")).toBeInTheDocument();
    expect(screen.getByText('"Leitora voraz"')).toBeInTheDocument();
    // "Campinas, SP" aparece no cabeçalho do perfil e no card do clube
    expect(screen.getAllByText(/Campinas/).length).toBeGreaterThanOrEqual(1);
  });

  it("mostra as quantidades de livros lidos e clubes", () => {
    mockQueryState({ data: profile });

    renderProfile();

    expect(screen.getByText("livros lidos").previousSibling).toHaveTextContent(
      "2",
    );
    expect(screen.getByText("clubes").previousSibling).toHaveTextContent("1");
  });

  it("lista os clubes do usuário na aba padrão", () => {
    mockQueryState({ data: profile });

    renderProfile();

    expect(screen.getByText("Clube da Fantasia")).toBeInTheDocument();
    expect(screen.getByText("administrador")).toBeInTheDocument();
  });

  it("mostra mensagem quando o usuário não participa de clubes", () => {
    mockQueryState({ data: { ...profile, clubs: [] } });

    renderProfile();

    expect(
      screen.getByText("Você ainda não participa de nenhum clube."),
    ).toBeInTheDocument();
  });

  it("mostra os livros lidos ao abrir a aba Meus livros", async () => {
    const user = userEvent.setup();
    mockQueryState({ data: profile });

    renderProfile();

    await user.click(screen.getByRole("tab", { name: "Meus livros" }));

    expect(screen.getByText("O Hobbit")).toBeInTheDocument();
    expect(screen.getByText("Duna")).toBeInTheDocument();
    expect(screen.queryByText("O Nome do Vento")).not.toBeInTheDocument();
  });

  it("filtra a lista ao trocar para a tag Lendo", async () => {
    const user = userEvent.setup();
    mockQueryState({ data: profile });

    renderProfile();

    await user.click(screen.getByRole("tab", { name: "Meus livros" }));
    await user.click(screen.getByText("Lendo"));

    expect(screen.getByText("O Nome do Vento")).toBeInTheDocument();
    expect(screen.queryByText("O Hobbit")).not.toBeInTheDocument();
  });

  it("mostra mensagem quando a lista de livros está vazia", async () => {
    const user = userEvent.setup();
    mockQueryState({ data: profile });

    renderProfile();

    await user.click(screen.getByRole("tab", { name: "Meus livros" }));
    await user.click(screen.getByText("Quero ler"));

    expect(
      screen.getByText("Nenhum livro nesta lista ainda."),
    ).toBeInTheDocument();
  });
});
