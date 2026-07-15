import { renderHook, waitFor, act } from "@testing-library/react";
import { useCancelMeetingAttendance } from "./useCancelMeetingAttendance";
import { cancelMeetingAttendance } from "../services/cancelMeetingAttendance";
import { createWrapper } from "./testQueryClient";

vi.mock("../services/cancelMeetingAttendance", () => ({
  cancelMeetingAttendance: vi.fn(),
}));

const cancelMeetingAttendanceMock = vi.mocked(cancelMeetingAttendance);

beforeEach(() => {
  cancelMeetingAttendanceMock.mockReset();
});

describe("useCancelMeetingAttendance", () => {
  it("chama cancelMeetingAttendance com o id do encontro", async () => {
    cancelMeetingAttendanceMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCancelMeetingAttendance("club-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate("meeting-1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cancelMeetingAttendanceMock.mock.calls[0][0]).toBe("meeting-1");
  });
});
