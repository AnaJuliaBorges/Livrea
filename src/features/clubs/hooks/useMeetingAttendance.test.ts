import { renderHook, waitFor } from "@testing-library/react";
import { useMeetingAttendance } from "./useMeetingAttendance";
import { getMeetingAttendance } from "../services/meetings";
import { createWrapper } from "./testQueryClient";
import type { MeetingAttendanceMember } from "../dtos";

vi.mock("../services/meetings", () => ({
  getMeetingAttendance: vi.fn(),
}));

const getMeetingAttendanceMock = vi.mocked(getMeetingAttendance);

beforeEach(() => {
  getMeetingAttendanceMock.mockReset();
});

describe("useMeetingAttendance", () => {
  it("busca a presença do encontro quando há meetingId", async () => {
    const members: MeetingAttendanceMember[] = [
      {
        id: "user-1",
        name: "Ana Júlia Borges",
        avatarUrl: null,
        isAdmin: true,
        confirmed: true,
      },
    ];
    getMeetingAttendanceMock.mockResolvedValue(members);

    const { result } = renderHook(() => useMeetingAttendance("meeting-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getMeetingAttendanceMock).toHaveBeenCalledWith("meeting-1");
    expect(result.current.data).toEqual(members);
  });

  it("não busca quando meetingId é undefined", () => {
    const { result } = renderHook(() => useMeetingAttendance(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getMeetingAttendanceMock).not.toHaveBeenCalled();
  });
});
