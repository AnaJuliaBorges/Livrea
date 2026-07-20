import { supabase } from "@/lib/supabase";
import {
  cancelMeetingAttendance,
  confirmMeetingAttendance,
  getMeetingAttendance,
  upsertNextMeeting,
} from "./meetings";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown = null, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

const meetingInput = {
  clubId: "club-1",
  location: "Biblioteca Central",
  date: "2026-08-01",
  time: "19:30",
};

describe("upsertNextMeeting", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC upsert_next_meeting juntando data e hora", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await upsertNextMeeting(meetingInput);

    expect(rpcMock).toHaveBeenCalledWith("upsert_next_meeting", {
      p_club_id: "club-1",
      p_location: "Biblioteca Central",
      p_meeting_date: "2026-08-01 19:30",
    });
  });

  it("faz trim do local antes de enviar", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await upsertNextMeeting({ ...meetingInput, location: "  Café Literário  " });

    expect(rpcMock).toHaveBeenCalledWith(
      "upsert_next_meeting",
      expect.objectContaining({ p_location: "Café Literário" }),
    );
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("data no passado")));

    await expect(upsertNextMeeting(meetingInput)).rejects.toThrow(
      "data no passado",
    );
  });
});

describe("getMeetingAttendance", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_meeting_attendance e mapeia o retorno", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        {
          id: "user-1",
          name: "Ana Júlia Borges",
          avatar_url: "https://cdn/avatars/user-1.png",
          is_admin: true,
          confirmed: true,
        },
        {
          id: "user-2",
          name: "Lucas Martins",
          avatar_url: null,
          is_admin: false,
          confirmed: false,
        },
      ]),
    );

    const members = await getMeetingAttendance("meeting-1");

    expect(rpcMock).toHaveBeenCalledWith("get_meeting_attendance", {
      p_meeting_id: "meeting-1",
    });
    expect(members).toEqual([
      {
        id: "user-1",
        name: "Ana Júlia Borges",
        avatarUrl: "https://cdn/avatars/user-1.png",
        isAdmin: true,
        confirmed: true,
      },
      {
        id: "user-2",
        name: "Lucas Martins",
        avatarUrl: null,
        isAdmin: false,
        confirmed: false,
      },
    ]);
  });

  it("retorna lista vazia quando a RPC não retorna dados", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    const members = await getMeetingAttendance("meeting-1");

    expect(members).toEqual([]);
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getMeetingAttendance("meeting-1")).rejects.toThrow("boom");
  });
});

describe("confirmMeetingAttendance", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC confirm_meeting_attendance com o id do encontro", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await confirmMeetingAttendance("meeting-1");

    expect(rpcMock).toHaveBeenCalledWith("confirm_meeting_attendance", {
      p_meeting_id: "meeting-1",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(confirmMeetingAttendance("meeting-1")).rejects.toThrow("boom");
  });
});

describe("cancelMeetingAttendance", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC cancel_meeting_attendance com o id do encontro", async () => {
    rpcMock.mockResolvedValue(rpcResult());

    await cancelMeetingAttendance("meeting-1");

    expect(rpcMock).toHaveBeenCalledWith("cancel_meeting_attendance", {
      p_meeting_id: "meeting-1",
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(cancelMeetingAttendance("meeting-1")).rejects.toThrow("boom");
  });
});
