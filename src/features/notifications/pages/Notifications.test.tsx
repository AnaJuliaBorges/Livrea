import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Notifications from "./Notifications";
import {
  getNotifications,
  markAllNotificationsRead,
} from "../services/getNotifications";
import type { AppNotification } from "../services/getNotifications";

import {
  ensurePushSubscription,
  getPushPermissionState,
} from "@/lib/push";

vi.mock("../services/getNotifications", () => ({
  getNotifications: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));
vi.mock("@/lib/push", () => ({
  ensurePushSubscription: vi.fn(),
  getPushPermissionState: vi.fn(),
}));

const getNotificationsMock = vi.mocked(getNotifications);
const markAllReadMock = vi.mocked(markAllNotificationsRead);
const ensurePushMock = vi.mocked(ensurePushSubscription);
const getPermissionMock = vi.mocked(getPushPermissionState);

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const notifications: AppNotification[] = [
  {
    id: "n1",
    title: "Novo pedido de participação",
    body: "Bruna pediu para entrar no clube Sci-fi.",
    url: "/clubes/club-1",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
  },
  {
    id: "n2",
    title: "Pedido aceito 🎉",
    body: "Você agora faz parte do clube Fantasia.",
    url: "/clubes/club-2",
    read: true,
    createdAt: new Date(Date.now() - 26 * 3_600_000).toISOString(),
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  markAllReadMock.mockResolvedValue(undefined);
  getPermissionMock.mockReturnValue("unsupported");
});

describe("Notifications", () => {
  it("lista as notificações com indicador de não lida", async () => {
    getNotificationsMock.mockResolvedValue(notifications);

    renderPage();

    await screen.findByText("Novo pedido de participação");

    expect(screen.getByText("Pedido aceito 🎉")).toBeInTheDocument();
    expect(screen.getAllByLabelText("não lida")).toHaveLength(1);
  });

  it("marca tudo como lida ao abrir quando há não lidas", async () => {
    getNotificationsMock.mockResolvedValue(notifications);

    renderPage();

    await waitFor(() => expect(markAllReadMock).toHaveBeenCalledTimes(1));
  });

  it("não marca nada quando tudo já está lido", async () => {
    getNotificationsMock.mockResolvedValue([notifications[1]]);

    renderPage();

    await screen.findByText("Pedido aceito 🎉");

    expect(markAllReadMock).not.toHaveBeenCalled();
  });

  it("navega pra url da notificação ao clicar", async () => {
    getNotificationsMock.mockResolvedValue(notifications);
    const user = userEvent.setup();

    renderPage();

    await user.click(await screen.findByText("Novo pedido de participação"));

    expect(navigateMock).toHaveBeenCalledWith("/clubes/club-1");
  });

  it("mostra estado vazio", async () => {
    getNotificationsMock.mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByText("Nenhuma notificação por aqui ainda."),
    ).toBeInTheDocument();
  });

  it("oferece ativar push quando a permissão nunca foi pedida", async () => {
    getNotificationsMock.mockResolvedValue([]);
    getPermissionMock.mockReturnValue("default");
    ensurePushMock.mockResolvedValue("subscribed");
    const user = userEvent.setup();

    renderPage();

    await user.click(screen.getByText("Ativar notificações"));

    expect(ensurePushMock).toHaveBeenCalledTimes(1);
  });

  it("não mostra o convite quando o aparelho não suporta push", async () => {
    getNotificationsMock.mockResolvedValue([]);

    renderPage();

    await screen.findByText("Nenhuma notificação por aqui ainda.");

    expect(screen.queryByText("Ativar notificações")).not.toBeInTheDocument();
  });

  it("avisa quando as notificações estão bloqueadas", async () => {
    getNotificationsMock.mockResolvedValue([]);
    getPermissionMock.mockReturnValue("denied");

    renderPage();

    expect(
      await screen.findByText(/notificações estão bloqueadas/),
    ).toBeInTheDocument();
  });
});
