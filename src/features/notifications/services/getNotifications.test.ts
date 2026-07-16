import { supabase } from "@/lib/supabase";
import {
  getNotifications,
  markAllNotificationsRead,
} from "./getNotifications";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const fromMock = vi.mocked(supabase.from);

const limitMock = vi.fn();
const orderMock = vi.fn(() => ({ limit: limitMock }));
const selectMock = vi.fn(() => ({ order: orderMock }));
const updateEqMock = vi.fn();
const updateMock = vi.fn(() => ({ eq: updateEqMock }));

beforeEach(() => {
  vi.clearAllMocks();
  fromMock.mockReturnValue({
    select: selectMock,
    update: updateMock,
  } as unknown as ReturnType<typeof supabase.from>);
});

describe("getNotifications", () => {
  it("busca as notificações mais recentes e mapeia o retorno", async () => {
    limitMock.mockResolvedValue({
      data: [
        {
          id: "n1",
          title: "Pedido aceito 🎉",
          body: "Você agora faz parte do clube Sci-fi.",
          url: "/clubes/club-1",
          read: false,
          created_at: "2026-07-16T12:00:00Z",
        },
      ],
      error: null,
    });

    const notifications = await getNotifications();

    expect(fromMock).toHaveBeenCalledWith("notifications");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(notifications).toEqual([
      {
        id: "n1",
        title: "Pedido aceito 🎉",
        body: "Você agora faz parte do clube Sci-fi.",
        url: "/clubes/club-1",
        read: false,
        createdAt: "2026-07-16T12:00:00Z",
      },
    ]);
  });

  it("retorna lista vazia sem dados e propaga erro", async () => {
    limitMock.mockResolvedValue({ data: null, error: null });
    expect(await getNotifications()).toEqual([]);

    limitMock.mockResolvedValue({ data: null, error: new Error("boom") });
    await expect(getNotifications()).rejects.toThrow("boom");
  });
});

describe("markAllNotificationsRead", () => {
  it("marca as não lidas como lidas", async () => {
    updateEqMock.mockResolvedValue({ error: null });

    await markAllNotificationsRead();

    expect(updateMock).toHaveBeenCalledWith({ read: true });
    expect(updateEqMock).toHaveBeenCalledWith("read", false);
  });

  it("propaga o erro do update", async () => {
    updateEqMock.mockResolvedValue({ error: new Error("rls") });

    await expect(markAllNotificationsRead()).rejects.toThrow("rls");
  });
});
