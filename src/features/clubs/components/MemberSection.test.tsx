import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MembersSection from "./MemberSection";
import { getClubMembers } from "../services/getClubMembers";
import { getJoinRequests } from "../services/getJoinRequests";
import type { Club } from "../dtos";

vi.mock("../services/getClubMembers", () => ({
  getClubMembers: vi.fn(),
}));
vi.mock("../services/getJoinRequests", () => ({
  getJoinRequests: vi.fn(),
}));

const getClubMembersMock = vi.mocked(getClubMembers);
const getJoinRequestsMock = vi.mocked(getJoinRequests);

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
  navigateMock.mockReset();
  getJoinRequestsMock.mockResolvedValue([]);
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
});
