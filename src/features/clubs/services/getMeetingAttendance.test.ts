import { supabase } from "@/lib/supabase";
import { getMeetingAttendance } from "./getMeetingAttendance";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

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
