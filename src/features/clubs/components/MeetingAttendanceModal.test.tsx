import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MeetingAttendanceModal } from "./MeetingAttendanceModal";
import { getMeetingAttendance } from "../services/getMeetingAttendance";
import { cancelMeetingAttendance } from "../services/cancelMeetingAttendance";
import { supabase } from "@/lib/supabase";
import type { MeetingAttendanceMember } from "../dtos";

vi.mock("../services/getMeetingAttendance", () => ({
  getMeetingAttendance: vi.fn(),
}));
vi.mock("../services/cancelMeetingAttendance", () => ({
  cancelMeetingAttendance: vi.fn(),
}));
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

const getMeetingAttendanceMock = vi.mocked(getMeetingAttendance);
const cancelMeetingAttendanceMock = vi.mocked(cancelMeetingAttendance);
const getUserMock = vi.mocked(supabase.auth.getUser);

function renderModal() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MeetingAttendanceModal
        clubId="club-1"
        meetingId="meeting-1"
        onClose={() => {}}
      />
    </QueryClientProvider>,
  );
}

const members: MeetingAttendanceMember[] = [
  { id: "user-me", name: "Ana Júlia", avatarUrl: null, isAdmin: false, confirmed: true },
  { id: "user-other", name: "Lucas Martins", avatarUrl: null, isAdmin: false, confirmed: true },
  { id: "user-pending", name: "Pedro Silva", avatarUrl: null, isAdmin: false, confirmed: false },
];

beforeEach(() => {
  getMeetingAttendanceMock.mockReset();
  cancelMeetingAttendanceMock.mockReset();
  getUserMock.mockReset();
  // @ts-expect-error mock simplificado, só o campo usado (data.user.id) importa
  getUserMock.mockResolvedValue({ data: { user: { id: "user-me" } } });
});

describe("MeetingAttendanceModal", () => {
  it("mostra o botão Cancelar só na própria linha confirmada", async () => {
    getMeetingAttendanceMock.mockResolvedValue(members);

    renderModal();

    await screen.findByText("Ana Júlia");
    await screen.findByText("Lucas Martins");

    expect(screen.getAllByText("Cancelar")).toHaveLength(1);
    expect(screen.queryByText("Pedro Silva")).toBeInTheDocument();
  });

  it("cancela a própria presença ao clicar em Cancelar", async () => {
    getMeetingAttendanceMock.mockResolvedValue(members);
    cancelMeetingAttendanceMock.mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderModal();

    await screen.findByText("Ana Júlia");
    await user.click(screen.getByText("Cancelar"));

    expect(cancelMeetingAttendanceMock.mock.calls[0][0]).toBe("meeting-1");
  });
});
