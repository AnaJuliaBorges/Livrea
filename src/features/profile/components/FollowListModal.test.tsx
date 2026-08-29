import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { FollowListModal } from "./FollowListModal";
import { useFollowers, useFollowing, useUnfollow } from "../hooks/useFollow";
import type { FollowUser } from "../services/follows";

vi.mock("../hooks/useFollow", () => ({
  useFollowers: vi.fn(),
  useFollowing: vi.fn(),
  useUnfollow: vi.fn(),
}));

const useFollowersMock = vi.mocked(useFollowers);
const useFollowingMock = vi.mocked(useFollowing);
const useUnfollowMock = vi.mocked(useUnfollow);

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

const unfollowMutate = vi.fn();

type QueryLike = { data: FollowUser[] | undefined; isLoading: boolean };

function query(data: FollowUser[] | undefined, isLoading = false): QueryLike {
  return { data, isLoading };
}

function setup(overrides: {
  followers?: QueryLike;
  following?: QueryLike;
  unfollowPending?: boolean;
}) {
  useFollowersMock.mockReturnValue(
    (overrides.followers ?? query([])) as never,
  );
  useFollowingMock.mockReturnValue(
    (overrides.following ?? query([])) as never,
  );
  useUnfollowMock.mockReturnValue({
    mutate: unfollowMutate,
    isPending: overrides.unfollowPending ?? false,
  } as never);
}

function renderModal(props: Partial<Parameters<typeof FollowListModal>[0]> = {}) {
  const onClose = props.onClose ?? vi.fn();
  render(
    <MemoryRouter>
      <FollowListModal
        userId="user-1"
        variant="followers"
        onClose={onClose}
        {...props}
      />
    </MemoryRouter>,
  );
  return { onClose };
}

const ana: FollowUser = { id: "u2", name: "Ana", avatarUrl: null };
const lucas: FollowUser = { id: "u3", name: "Lucas", avatarUrl: null };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FollowListModal", () => {
  it("mostra o título e a lista de seguidores", () => {
    setup({ followers: query([ana, lucas]) });
    renderModal({ variant: "followers" });

    expect(
      screen.getByRole("heading", { name: "Seguidores" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Lucas")).toBeInTheDocument();
  });

  it("mostra o estado de carregando", () => {
    setup({ followers: query(undefined, true) });
    renderModal({ variant: "followers" });

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("mostra o vazio de seguidores", () => {
    setup({ followers: query([]) });
    renderModal({ variant: "followers" });

    expect(screen.getByText("Nenhum seguidor ainda.")).toBeInTheDocument();
  });

  it("no modo seguindo usa o título e o vazio corretos", () => {
    setup({ following: query([]) });
    renderModal({ variant: "following" });

    expect(
      screen.getByRole("heading", { name: "Seguindo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Não está seguindo ninguém ainda."),
    ).toBeInTheDocument();
  });

  it("clicar num usuário fecha o modal e navega para o perfil dele", async () => {
    const user = userEvent.setup();
    setup({ followers: query([ana]) });
    const { onClose } = renderModal({ variant: "followers" });

    await user.click(screen.getByRole("button", { name: /Ana/ }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/perfil/u2");
  });

  const findRemoveButton = () =>
    screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "");

  it("não mostra o botão de deixar de seguir sem canUnfollow", () => {
    setup({ following: query([ana]) });
    renderModal({ variant: "following" });

    expect(findRemoveButton()).toBeUndefined();
  });

  it("com canUnfollow, o botão chama unfollow com o id do usuário", async () => {
    const user = userEvent.setup();
    setup({ following: query([ana]) });
    renderModal({ variant: "following", canUnfollow: true });

    const removeButton = findRemoveButton();
    expect(removeButton).toBeDefined();
    await user.click(removeButton!);

    expect(unfollowMutate).toHaveBeenCalledWith("u2");
  });

  it("o botão Fechar chama onClose", async () => {
    const user = userEvent.setup();
    setup({ followers: query([]) });
    const { onClose } = renderModal({ variant: "followers" });

    await user.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
