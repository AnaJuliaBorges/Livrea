import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import RegisterReadHistory from "./RegisterReadHistory";
import {
  useDeleteReadingLog,
  useSaveReadingProgress,
} from "../hooks/useReadingTracking";
import type { ReadingLogEntry } from "../services/readingTracking";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../hooks/useReadingTracking");

const useSaveReadingProgressMock = vi.mocked(useSaveReadingProgress);
const useDeleteReadingLogMock = vi.mocked(useDeleteReadingLog);

function mockMutation({ save = vi.fn(), isPending = false } = {}) {
  useSaveReadingProgressMock.mockReturnValue({
    mutateAsync: save,
    isPending,
  } as unknown as ReturnType<typeof useSaveReadingProgress>);
  return save;
}

async function selectFeeling(user: ReturnType<typeof userEvent.setup>, label: string) {
  const container = screen.getByText(label).closest("div") as HTMLElement;
  await user.click(within(container).getByRole("button"));
}

beforeEach(() => {
  vi.clearAllMocks();
  useDeleteReadingLogMock.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useDeleteReadingLog>);
});

describe("RegisterReadHistory", () => {
  it("exclui um registro do histórico", async () => {
    mockMutation();
    const deleteMutate = vi.fn();
    useDeleteReadingLogMock.mockReturnValue({
      mutate: deleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteReadingLog>);
    const user = userEvent.setup();

    render(
      <RegisterReadHistory
        bookId="book-1"
        totalPages={300}
        lastProgress={120}
        logs={[
          {
            id: "log-1",
            pages_read: 120,
            feeling: "amei",
            note: null,
            created_at: "2026-07-10T12:00:00Z",
          },
        ]}
      />,
    );

    await user.click(screen.getByLabelText("Excluir registro"));

    // nada é excluído antes de confirmar no modal
    expect(deleteMutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Excluir" }));

    expect(deleteMutate.mock.calls[0][0]).toBe("log-1");
  });

  it("mostra o progresso atual e o total de páginas", () => {
    mockMutation();

    render(
      <RegisterReadHistory
        bookId="book-1"
        totalPages={300}
        lastProgress={50}
        logs={[]}
      />,
    );

    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("300")).toBeInTheDocument();
  });

  it("mostra mensagem quando não há histórico", () => {
    mockMutation();

    render(
      <RegisterReadHistory
        bookId="book-1"
        totalPages={300}
        lastProgress={0}
        logs={[]}
      />,
    );

    expect(
      screen.getByText("Nenhum registro ainda. Salve seu primeiro progresso!"),
    ).toBeInTheDocument();
  });

  it("lista os registros de leitura", () => {
    mockMutation();
    const logs: ReadingLogEntry[] = [
      {
        id: "log-1",
        pages_read: 150,
        feeling: "gostei",
        note: "Capítulo forte, gostei do plot twist.",
        created_at: "2026-01-01T00:00:00",
      },
      {
        id: "log-2",
        pages_read: 100,
        feeling: "ok",
        note: null,
        created_at: "2025-12-30T00:00:00",
      },
    ];

    render(
      <RegisterReadHistory
        bookId="book-1"
        totalPages={300}
        lastProgress={150}
        logs={logs}
      />,
    );

    expect(screen.getByText("150 páginas lidas")).toBeInTheDocument();
    // anotação aparece só no registro que tem
    expect(
      screen.getByText('"Capítulo forte, gostei do plot twist."'),
    ).toBeInTheDocument();
  });

  it("esconde a seção de progresso quando a leitura já terminou", () => {
    mockMutation();

    render(
      <RegisterReadHistory
        bookId="book-1"
        totalPages={300}
        lastProgress={300}
        logs={[]}
      />,
    );

    expect(screen.queryByText("Página atual")).not.toBeInTheDocument();
  });

  it("incrementa e decrementa a página atual", async () => {
    const user = userEvent.setup();
    mockMutation();

    render(
      <RegisterReadHistory
        bookId="book-1"
        totalPages={300}
        lastProgress={50}
        logs={[]}
      />,
    );

    await user.click(screen.getByText("+"));
    expect(screen.getByText("51")).toBeInTheDocument();

    await user.click(screen.getByText("-"));
    await user.click(screen.getByText("-"));
    expect(screen.getByText("49")).toBeInTheDocument();
  });

  it("desabilita o decremento em 0 e o incremento no total de páginas", async () => {
    const user = userEvent.setup();
    mockMutation();

    render(
      <RegisterReadHistory
        bookId="book-1"
        totalPages={10}
        lastProgress={0}
        logs={[]}
      />,
    );

    expect(screen.getByText("-")).toBeDisabled();

    for (let i = 0; i < 10; i++) {
      await user.click(screen.getByText("+"));
    }

    expect(screen.getByText("+")).toBeDisabled();
  });

  it("mantém o botão de salvar desabilitado até escolher um sentimento", async () => {
    const user = userEvent.setup();
    const save = mockMutation();
    save.mockResolvedValue(undefined);

    render(
      <RegisterReadHistory
        bookId="book-1"
        totalPages={300}
        lastProgress={50}
        logs={[]}
      />,
    );

    expect(screen.getByText("Salvar registro")).toBeDisabled();

    await selectFeeling(user, "gostei");
    expect(screen.getByText("Salvar registro")).not.toBeDisabled();

    await user.click(screen.getByText("Salvar registro"));

    expect(save).toHaveBeenCalledWith({
      currentPage: 50,
      feeling: "gostei",
      note: "",
    });
    expect(toast.success).toHaveBeenCalledWith("Registro salvo!");
  });

  it("envia a anotação junto com o registro e limpa o campo após salvar", async () => {
    const user = userEvent.setup();
    const save = mockMutation();
    save.mockResolvedValue(undefined);

    render(
      <RegisterReadHistory
        bookId="book-1"
        totalPages={300}
        lastProgress={50}
        logs={[]}
      />,
    );

    const noteInput = screen.getByPlaceholderText(
      "Anotação (opcional): o que achou desse trecho?",
    );
    await user.type(noteInput, "Que reviravolta!");
    await selectFeeling(user, "amei");
    await user.click(screen.getByText("Salvar registro"));

    expect(save).toHaveBeenCalledWith({
      currentPage: 50,
      feeling: "amei",
      note: "Que reviravolta!",
    });
    expect(noteInput).toHaveValue("");
  });

  it("mostra erro quando salvar o registro falha", async () => {
    const user = userEvent.setup();
    const save = mockMutation();
    save.mockRejectedValue(new Error("falhou"));

    render(
      <RegisterReadHistory
        bookId="book-1"
        totalPages={300}
        lastProgress={50}
        logs={[]}
      />,
    );

    await selectFeeling(user, "amei");
    await user.click(screen.getByText("Salvar registro"));

    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível salvar o registro. Tente novamente.",
    );
  });

  it("atualiza a página atual quando lastProgress muda após salvar", () => {
    mockMutation();

    const { rerender } = render(
      <RegisterReadHistory
        bookId="book-1"
        totalPages={300}
        lastProgress={50}
        logs={[]}
      />,
    );

    rerender(
      <RegisterReadHistory
        bookId="book-1"
        totalPages={300}
        lastProgress={80}
        logs={[]}
      />,
    );

    expect(screen.getByText("80")).toBeInTheDocument();
  });
});
