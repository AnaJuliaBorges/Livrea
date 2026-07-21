import * as Sentry from "@sentry/react";
import { reportError } from "./reportError";

vi.mock("@sentry/react", () => ({ captureException: vi.fn() }));

const captureExceptionMock = vi.mocked(Sentry.captureException);
const consoleErrorMock = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});

beforeEach(() => {
  captureExceptionMock.mockClear();
  consoleErrorMock.mockClear();
});

describe("reportError", () => {
  it("manda o erro pro Sentry com source como tag e detail como extra", () => {
    const error = new Error("falha ao buscar clubes");

    reportError(error, { source: "query", detail: '["clubs"]' });

    expect(captureExceptionMock).toHaveBeenCalledWith(error, {
      tags: { source: "query" },
      extra: { detail: '["clubs"]' },
    });
  });

  it("reporta também quando não há detail", () => {
    const error = new Error("falha ao salvar");

    reportError(error, { source: "mutation" });

    expect(captureExceptionMock).toHaveBeenCalledWith(error, {
      tags: { source: "mutation" },
      extra: { detail: undefined },
    });
  });

  it("prefixa o log de desenvolvimento com a origem e o detalhe", () => {
    const error = new Error("falha ao buscar clubes");

    reportError(error, { source: "query", detail: '["clubs"]' });

    expect(consoleErrorMock).toHaveBeenCalledWith(
      '[query ["clubs"]] falha ao buscar clubes',
      error,
    );
  });

  it("omite o detalhe do log quando não é informado", () => {
    const error = new Error("falha ao salvar");

    reportError(error, { source: "mutation" });

    expect(consoleErrorMock).toHaveBeenCalledWith(
      "[mutation] falha ao salvar",
      error,
    );
  });

  it("aceita erro que não é Error", () => {
    reportError("deu ruim", { source: "route", detail: "/clubes" });

    expect(consoleErrorMock).toHaveBeenCalledWith(
      "[route /clubes] deu ruim",
      "deu ruim",
    );
  });

  it("serializa valores sem mensagem", () => {
    reportError({ code: 500 }, { source: "query" });

    expect(consoleErrorMock).toHaveBeenCalledWith("[query] [object Object]", {
      code: 500,
    });
  });
});
