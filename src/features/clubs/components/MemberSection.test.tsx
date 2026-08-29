import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MembersSection from "./MemberSection";
import { getClubMembers } from "../services/clubMembers";
import { getJoinRequests } from "../services/joinRequests";
import {
  approveJoinRequest,
  rejectJoinRequest,
} from "../services/joinRequests";
import {
  demoteClubMember,
  promoteClubMember,
  removeClubMember,
} from "../services/clubMembers";
import type { Club, ClubMember } from "../dtos";

vi.mock("../services/clubMembers", () => ({
  getClubMembers: vi.fn(),
  promoteClubMember: vi.fn(),
  demoteClubMember: vi.fn(),
  removeClubMember: vi.fn(),
}));
vi.mock("../services/joinRequests", () => ({
  getJoinRequests: vi.fn(),
  approveJoinRequest: vi.fn(),
  rejectJoinRequest: vi.fn(),
}));

const getClubMembersMock = vi.mocked(getClubMembers);
const getJoinRequestsMock = vi.mocked(getJoinRequests);
const approveJoinRequestMock = vi.mocked(approveJoinRequest);
const rejectJoinRequestMock = vi.mocked(rejectJoinRequest);
const promoteClubMemberMock = vi.mocked(promoteClubMember);
const demoteClubMemberMock = vi.mocked(demoteClubMember);
const removeClubMemberMock = vi.mocked(removeClubMember);

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

function member(overrides: Partial<ClubMember> = {}): ClubMember {
  return {
    id: "user-2",
    name: "Lucas Martins",
    avatarUrl: null,
    isAdmin: false,
    isOwner: false,
    ...overrides,
  };
}

const baseClub: Club = {
  id: "club-1",
  name: "Clube da Fantasia",
  description: "",
  coverUrl: null,
  headerColor: "purple",
  isPrivate: false,
  isMember: true,
  isAdmin: false,
  isOwner: false,
  hasPendingRequest: false,
  participantLimit: null,
  type: "in_person",
  frequency: null,
  customFrequency: null,
  currentReading: null,
  genres: [],
  cityId: null,
  stateId: null,
  cityName: "",
  stateAbbreviation: "",
  totalParticipants: 0,
  meetingDescription: "",
  nextMeeting: null,
  rules: "",
  readingHistory: [],
};

function renderMembers(club: Club = baseClub) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <MembersSection club={club} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getClubMembersMock.mockReset();
  getJoinRequestsMock.mockReset();
  approveJoinRequestMock.mockReset();
  rejectJoinRequestMock.mockReset();
  promoteClubMemberMock.mockReset();
  demoteClubMemberMock.mockReset();
  removeClubMemberMock.mockReset();
  navigateMock.mockReset();
  getJoinRequestsMock.mockResolvedValue([]);
  approveJoinRequestMock.mockResolvedValue(undefined);
  rejectJoinRequestMock.mockResolvedValue(undefined);
  promoteClubMemberMock.mockResolvedValue(undefined);
  demoteClubMemberMock.mockResolvedValue(undefined);
  removeClubMemberMock.mockResolvedValue(undefined);
});

describe("MembersSection", () => {
  it("navega para o perfil do participante ao clicar", async () => {
    getClubMembersMock.mockResolvedValue([member()]);
    const user = userEvent.setup();

    renderMembers();

    await screen.findByText("Lucas Martins");
    await user.click(screen.getByText("Lucas Martins"));

    expect(navigateMock).toHaveBeenCalledWith("/perfil/user-2");
  });

  it("mostra o badge de administrador e navega para o perfil dele também", async () => {
    getClubMembersMock.mockResolvedValue([
      member({ id: "user-3", name: "Ana Júlia Borges", isAdmin: true }),
    ]);
    const user = userEvent.setup();

    renderMembers();

    await screen.findByText("Ana Júlia Borges");
    expect(screen.getByText("Administrador")).toBeInTheDocument();

    await user.click(screen.getByText("Ana Júlia Borges"));

    expect(navigateMock).toHaveBeenCalledWith("/perfil/user-3");
  });

  it("mostra o badge de Criador no dono do clube", async () => {
    getClubMembersMock.mockResolvedValue([
      member({ id: "user-1", name: "Dona Ana", isAdmin: true, isOwner: true }),
    ]);

    renderMembers();

    await screen.findByText("Dona Ana");
    expect(screen.getByText("Criador")).toBeInTheDocument();
    expect(screen.queryByText("Administrador")).not.toBeInTheDocument();
  });

  it("navega para o perfil de quem pediu pra entrar no clube", async () => {
    getClubMembersMock.mockResolvedValue([member()]);
    getJoinRequestsMock.mockResolvedValue([
      { requestId: "req-1", userId: "user-4", name: "Pedro Silva", avatarUrl: null },
    ]);
    const user = userEvent.setup();

    renderMembers({ ...baseClub, isAdmin: true, isPrivate: true });

    await screen.findByText("Pedro Silva");
    await user.click(screen.getByText("Pedro Silva"));

    expect(navigateMock).toHaveBeenCalledWith("/perfil/user-4");
  });

  it("não navega ao aprovar ou recusar um pedido", async () => {
    getClubMembersMock.mockResolvedValue([member()]);
    getJoinRequestsMock.mockResolvedValue([
      { requestId: "req-1", userId: "user-4", name: "Pedro Silva", avatarUrl: null },
    ]);
    const user = userEvent.setup();

    renderMembers({ ...baseClub, isAdmin: true, isPrivate: true });

    await screen.findByText("Pedro Silva");
    await user.click(
      screen.getByRole("button", { name: "Aprovar pedido de Pedro Silva" }),
    );

    expect(approveJoinRequestMock.mock.calls[0][0]).toBe("req-1");
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("não mostra ações de admin quando o usuário não é o dono", async () => {
    getClubMembersMock.mockResolvedValue([member()]);

    renderMembers({ ...baseClub, isAdmin: true, isOwner: false });

    await screen.findByText("Lucas Martins");
    expect(screen.queryByText("Tornar admin")).not.toBeInTheDocument();
  });

  it("o dono promove um participante e não dispara navegação", async () => {
    getClubMembersMock.mockResolvedValue([member()]);
    const user = userEvent.setup();

    renderMembers({ ...baseClub, isOwner: true });

    await screen.findByText("Lucas Martins");
    await user.click(screen.getByRole("button", { name: "Tornar admin" }));

    expect(promoteClubMemberMock).toHaveBeenCalledWith("club-1", "user-2");
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("o dono rebaixa um admin", async () => {
    getClubMembersMock.mockResolvedValue([member({ isAdmin: true })]);
    const user = userEvent.setup();

    renderMembers({ ...baseClub, isOwner: true });

    await screen.findByText("Lucas Martins");
    await user.click(screen.getByRole("button", { name: "Remover admin" }));

    expect(demoteClubMemberMock).toHaveBeenCalledWith("club-1", "user-2");
  });

  it("não mostra ação de papel na linha do próprio dono", async () => {
    getClubMembersMock.mockResolvedValue([
      member({ id: "user-1", name: "Dona Ana", isAdmin: true, isOwner: true }),
      member(),
    ]);

    renderMembers({ ...baseClub, isOwner: true });

    await screen.findByText("Dona Ana");
    expect(screen.getAllByRole("button", { name: "Tornar admin" })).toHaveLength(
      1,
    );
  });

  it("não mostra ação de remover quando o usuário não é o dono", async () => {
    getClubMembersMock.mockResolvedValue([member()]);

    renderMembers({ ...baseClub, isAdmin: true, isOwner: false });

    await screen.findByText("Lucas Martins");
    expect(
      screen.queryByRole("button", { name: "Remover Lucas Martins do clube" }),
    ).not.toBeInTheDocument();
  });

  it("o dono remove um participante após confirmar", async () => {
    getClubMembersMock.mockResolvedValue([member()]);
    const user = userEvent.setup();

    renderMembers({ ...baseClub, isOwner: true });

    await screen.findByText("Lucas Martins");
    await user.click(
      screen.getByRole("button", { name: "Remover Lucas Martins do clube" }),
    );

    await screen.findByText("Remover participante");
    await user.click(screen.getByRole("button", { name: "Remover" }));

    expect(removeClubMemberMock).toHaveBeenCalledWith("club-1", "user-2");
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
