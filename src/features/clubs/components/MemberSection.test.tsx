import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MembersSection from "./MemberSection";
import { getClubMembers } from "../services/getClubMembers";
import { getJoinRequests } from "../services/getJoinRequests";
import {
  approveJoinRequest,
  rejectJoinRequest,
} from "../services/reviewJoinRequest";
import type { Club } from "../dtos";

vi.mock("../services/getClubMembers", () => ({
  getClubMembers: vi.fn(),
}));
vi.mock("../services/getJoinRequests", () => ({
  getJoinRequests: vi.fn(),
}));
vi.mock("../services/reviewJoinRequest", () => ({
  approveJoinRequest: vi.fn(),
  rejectJoinRequest: vi.fn(),
}));

const getClubMembersMock = vi.mocked(getClubMembers);
const getJoinRequestsMock = vi.mocked(getJoinRequests);
const approveJoinRequestMock = vi.mocked(approveJoinRequest);
const rejectJoinRequestMock = vi.mocked(rejectJoinRequest);

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

const baseClub: Club = {
  id: "club-1",
  name: "Clube da Fantasia",
  description: "",
  coverUrl: null,
  isPrivate: false,
  isMember: true,
  isAdmin: false,
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
  navigateMock.mockReset();
  getJoinRequestsMock.mockResolvedValue([]);
  approveJoinRequestMock.mockResolvedValue(undefined);
  rejectJoinRequestMock.mockResolvedValue(undefined);
});

describe("MembersSection", () => {
  it("navega para o perfil do participante ao clicar", async () => {
    getClubMembersMock.mockResolvedValue([
      { id: "user-2", name: "Lucas Martins", avatarUrl: null, isAdmin: false },
    ]);
    const user = userEvent.setup();

    renderMembers();

    await screen.findByText("Lucas Martins");
    await user.click(screen.getByText("Lucas Martins"));

    expect(navigateMock).toHaveBeenCalledWith("/perfil/user-2");
  });

  it("mostra o badge de administrador e navega para o perfil dele também", async () => {
    getClubMembersMock.mockResolvedValue([
      { id: "user-3", name: "Ana Júlia Borges", avatarUrl: null, isAdmin: true },
    ]);
    const user = userEvent.setup();

    renderMembers();

    await screen.findByText("Ana Júlia Borges");
    expect(screen.getByText("Administrador")).toBeInTheDocument();

    await user.click(screen.getByText("Ana Júlia Borges"));

    expect(navigateMock).toHaveBeenCalledWith("/perfil/user-3");
  });

  it("navega para o perfil de quem pediu pra entrar no clube", async () => {
    getClubMembersMock.mockResolvedValue([
      { id: "user-2", name: "Lucas Martins", avatarUrl: null, isAdmin: false },
    ]);
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
    getClubMembersMock.mockResolvedValue([
      { id: "user-2", name: "Lucas Martins", avatarUrl: null, isAdmin: false },
    ]);
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
});
