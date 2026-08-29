import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Profile from "./Profile";
import { useMyProfile } from "../hooks/useMyProfile";
import { useUserProfile } from "../hooks/useUserProfile";
import {
  useFollowInfo,
  useFollowUser,
  useUnfollowUser,
} from "../hooks/useFollow";
import { useProfileHeaderColor } from "../hooks/useProfileHeaderColor";
import type { UserProfile } from "../dtos";

vi.mock("../hooks/useMyProfile");
vi.mock("../hooks/useUserProfile");
vi.mock("../hooks/useFollow");
vi.mock("../hooks/useProfileHeaderColor");

const useMyProfileMock = vi.mocked(useMyProfile);
const useUserProfileMock = vi.mocked(useUserProfile);
const useFollowInfoMock = vi.mocked(useFollowInfo);
const useFollowUserMock = vi.mocked(useFollowUser);
const useUnfollowUserMock = vi.mocked(useUnfollowUser);
const useProfileHeaderColorMock = vi.mocked(useProfileHeaderColor);

const followMutate = vi.fn();
const unfollowMutate = vi.fn();

function mockFollowState(state: {
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  loaded?: boolean;
}) {
  useFollowInfoMock.mockReturnValue({
    data:
      state.loaded === false
        ? undefined
        : {
            followersCount: state.followersCount ?? 0,
            followingCount: state.followingCount ?? 0,
            isFollowing: state.isFollowing ?? false,
          },
  } as ReturnType<typeof useFollowInfo>);
  useFollowUserMock.mockReturnValue({
    mutate: followMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useFollowUser>);
  useUnfollowUserMock.mockReturnValue({
    mutate: unfollowMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUnfollowUser>);
}

function mockQueryState(state: {
  data?: UserProfile;
  isLoading?: boolean;
  isError?: boolean;
}) {
  const result = {
    data: state.data,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
  } as ReturnType<typeof useMyProfile>;

  useMyProfileMock.mockReturnValue(result);
  useUserProfileMock.mockReturnValue(result);
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
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function renderOtherProfile(userId: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/perfil/${userId}`]}>
        <Routes>
          <Route path="/perfil/:id" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFollowState({ followersCount: 0, isFollowing: false });
    useProfileHeaderColorMock.mockReturnValue({
      data: "purple",
    } as ReturnType<typeof useProfileHeaderColor>);
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
    expect(screen.getAllByText(/Campinas/).length).toBeGreaterThanOrEqual(1);
  });

  it("mostra as quantidades de livros lidos, seguidores e seguindo", () => {
    mockQueryState({ data: profile });
    mockFollowState({ followersCount: 3, followingCount: 5 });

    renderProfile();

    expect(screen.getByText("livros lidos").previousSibling).toHaveTextContent(
      "2",
    );
    expect(screen.getByText("seguidores").previousSibling).toHaveTextContent(
      "3",
    );
    expect(screen.getByText("seguindo").previousSibling).toHaveTextContent("5");
  });

  it("mostra a quantidade de clubes no rótulo da aba", () => {
    mockQueryState({ data: profile });

    renderProfile();

    expect(
      screen.getByRole("tab", { name: "Meus clubes (1)" }),
    ).toBeInTheDocument();
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

  it("ao ver o perfil de outra pessoa, busca via useUserProfile e esconde o botão de configurações", () => {
    mockQueryState({ data: profile });

    renderOtherProfile("user-1");

    expect(useUserProfileMock).toHaveBeenCalledWith("user-1");
    expect(screen.getByText("Ana Julia Borges")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /configura/i }),
    ).not.toBeInTheDocument();
    expect(document.querySelector("svg.lucide-settings")).not.toBeInTheDocument();
  });

  it("ao ver o perfil de outra pessoa sem clubes, mostra mensagem específica", () => {
    mockQueryState({ data: { ...profile, clubs: [] } });

    renderOtherProfile("user-1");

    expect(
      screen.getByText("Este usuário ainda não participa de nenhum clube."),
    ).toBeInTheDocument();
  });

  it("não mostra o botão de seguir no próprio perfil", () => {
    mockQueryState({ data: profile });

    renderProfile();

    expect(
      screen.queryByRole("button", { name: "Seguir" }),
    ).not.toBeInTheDocument();
  });

  it("mostra o botão de seguir no perfil de outra pessoa e segue ao clicar", async () => {
    const user = userEvent.setup();
    mockQueryState({ data: profile });

    renderOtherProfile("user-1");

    const followButton = screen.getByRole("button", { name: "Seguir" });
    expect(followButton).toBeInTheDocument();

    await user.click(followButton);

    expect(followMutate).toHaveBeenCalled();
    expect(unfollowMutate).not.toHaveBeenCalled();
  });

  it("quando já segue, o botão vira Deixar de seguir e desfaz ao clicar", async () => {
    const user = userEvent.setup();
    mockQueryState({ data: profile });
    mockFollowState({ isFollowing: true });

    renderOtherProfile("user-1");

    const unfollowButton = screen.getByRole("button", {
      name: "Deixar de seguir",
    });

    await user.click(unfollowButton);

    expect(unfollowMutate).toHaveBeenCalled();
    expect(followMutate).not.toHaveBeenCalled();
  });

  it("desabilita o botão de seguir enquanto o estado de follow não carrega", () => {
    mockQueryState({ data: profile });
    mockFollowState({ loaded: false });

    renderOtherProfile("user-1");

    expect(screen.getByRole("button", { name: "Seguir" })).toBeDisabled();
  });

  it("mostra a contagem de seguidores no card de seguidores", () => {
    mockQueryState({ data: profile });
    mockFollowState({ followersCount: 5 });

    renderProfile();

    expect(screen.getByText("seguidores").previousSibling).toHaveTextContent(
      "5",
    );
  });

  it("usa rótulos genéricos de aba (Clubes/Livros) no perfil de outra pessoa", () => {
    mockQueryState({ data: profile });

    renderOtherProfile("user-1");

    expect(screen.getByRole("tab", { name: "Clubes (1)" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Livros" })).toBeInTheDocument();
  });
});
