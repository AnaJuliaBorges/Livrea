import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { WelcomeTour } from "./WelcomeTour";
import {
  getWelcomeTourSeen,
  markWelcomeTourSeen,
} from "../services/welcomeTour";
import { welcomeTourSteps } from "../model/steps";

vi.mock("../services/welcomeTour", () => ({
  getWelcomeTourSeen: vi.fn(),
  markWelcomeTourSeen: vi.fn(),
}));

const getSeenMock = vi.mocked(getWelcomeTourSeen);
const markSeenMock = vi.mocked(markWelcomeTourSeen);

function renderTour(initialEntry = "/clubes") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <WelcomeTour />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // padrão: usuário ainda não viu o tour
  getSeenMock.mockResolvedValue(false);
  markSeenMock.mockResolvedValue(undefined);
});

describe("WelcomeTour", () => {
  it("aparece no primeiro acesso do usuário, começando pelo primeiro passo", async () => {
    renderTour();

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(welcomeTourSteps[0].title)).toBeInTheDocument();
  });

  it("não aparece se a conta já viu", async () => {
    getSeenMock.mockResolvedValue(true);

    renderTour();

    // espera o efeito assíncrono resolver antes de afirmar a ausência
    await waitFor(() => expect(getSeenMock).toHaveBeenCalled());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reabre com ?tour=1 mesmo já tendo sido visto", async () => {
    getSeenMock.mockResolvedValue(true);

    renderTour("/clubes?tour=1");

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("avança e volta entre os passos", async () => {
    const user = userEvent.setup();
    renderTour();
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(screen.getByText(welcomeTourSteps[1].title)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByText(welcomeTourSteps[0].title)).toBeInTheDocument();
  });

  it("no último passo o botão finaliza e marca como visto para a conta", async () => {
    const user = userEvent.setup();
    renderTour();
    await screen.findByRole("dialog");

    for (let i = 0; i < welcomeTourSteps.length - 1; i++) {
      await user.click(screen.getByRole("button", { name: "Próximo" }));
    }

    await user.click(screen.getByRole("button", { name: "Começar a ler" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(markSeenMock).toHaveBeenCalledTimes(1);
  });

  it("pular fecha e marca como visto", async () => {
    const user = userEvent.setup();
    renderTour();
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "Pular" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(markSeenMock).toHaveBeenCalledTimes(1);
  });

  it("marca o indicador do passo atual", async () => {
    const user = userEvent.setup();
    renderTour();
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "Próximo" }));

    const dots = screen.getAllByTestId("welcome-tour-dot");
    expect(dots).toHaveLength(welcomeTourSteps.length);
    expect(dots[1]).toHaveAttribute("data-active", "true");
  });

  it("não quebra quando gravar a flag falha", async () => {
    markSeenMock.mockRejectedValue(new Error("offline"));
    const user = userEvent.setup();
    renderTour();
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "Pular" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
