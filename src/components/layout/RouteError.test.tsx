import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouteError } from "./RouteError";
import { reportError } from "@/lib/reportError";

vi.mock("@/lib/reportError", () => ({ reportError: vi.fn() }));

const navigateMock = vi.fn();
const routeErrorMock = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useRouteError: () => routeErrorMock(),
  };
});

const reloadMock = vi.fn();
const reportErrorMock = vi.mocked(reportError);

beforeAll(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { ...window.location, pathname: "/clubes", reload: reloadMock },
  });
});

beforeEach(() => {
  navigateMock.mockReset();
  reloadMock.mockReset();
  reportErrorMock.mockReset();
  routeErrorMock.mockReset();
});

const notFoundResponse = {
  status: 404,
  statusText: "Not Found",
  internal: true,
  data: null,
};

describe("RouteError", () => {
  it.each([
    "Failed to fetch dynamically imported module: /assets/ClubDetails-a1b2.js",
    "error loading dynamically imported module",
    "Importing a module script failed.",
  ])("reconhece '%s' como chunk de versão antiga", (message) => {
    routeErrorMock.mockReturnValue(new Error(message));

    render(<RouteError />);

    expect(screen.getByText("Nova versão disponível")).toBeInTheDocument();
  });

  it("mostra a mensagem genérica e reporta o erro", () => {
    const error = new Error("boom");
    routeErrorMock.mockReturnValue(error);

    render(<RouteError />);

    expect(screen.getByText("Algo deu errado")).toBeInTheDocument();
    expect(reportErrorMock).toHaveBeenCalledWith(error, {
      source: "route",
      detail: "/clubes",
    });
  });

  it("recarrega a página ao clicar em tentar novamente", async () => {
    const user = userEvent.setup();
    routeErrorMock.mockReturnValue(new Error("boom"));

    render(<RouteError />);
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(reloadMock).toHaveBeenCalled();
  });

  it("volta ao início ao clicar no botão correspondente", async () => {
    const user = userEvent.setup();
    routeErrorMock.mockReturnValue(new Error("boom"));

    render(<RouteError />);
    await user.click(screen.getByRole("button", { name: "Voltar ao início" }));

    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("trata rota inexistente como 404, sem botão de recarregar", () => {
    routeErrorMock.mockReturnValue(notFoundResponse);

    render(<RouteError />);

    expect(screen.getByText("Página não encontrada")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Tentar novamente" }),
    ).not.toBeInTheDocument();
  });

  it("não reporta 404 nem chunk desatualizado", () => {
    routeErrorMock.mockReturnValue(notFoundResponse);
    const { unmount } = render(<RouteError />);
    unmount();

    routeErrorMock.mockReturnValue(
      new Error("Failed to fetch dynamically imported module"),
    );
    render(<RouteError />);

    expect(reportErrorMock).not.toHaveBeenCalled();
  });

  it("pede recarga quando o chunk é de uma versão antiga", () => {
    routeErrorMock.mockReturnValue(
      new Error("Failed to fetch dynamically imported module"),
    );

    render(<RouteError />);

    expect(screen.getByText("Nova versão disponível")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Recarregar" }),
    ).toBeInTheDocument();
  });
});
