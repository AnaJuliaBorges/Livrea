import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import RegisterReadHighlights from "./RegisterReadHighlights";
import {
  useDeleteHighlight,
  useSaveHighlight,
  useUpdateHighlight,
} from "../hooks/useReadingTracking";
import type { BookHighlightEntry } from "../services/readingTracking";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../hooks/useReadingTracking");

const useSaveHighlightMock = vi.mocked(useSaveHighlight);
const useUpdateHighlightMock = vi.mocked(useUpdateHighlight);
const useDeleteHighlightMock = vi.mocked(useDeleteHighlight);

const highlights: BookHighlightEntry[] = [
  { id: "hl-1", page: 42, quote: "Uma frase marcante" },
];

function mockMutations({
  save = vi.fn(),
  saveIsPending = false,
  update = vi.fn(),
  updateIsPending = false,
} = {}) {
  useSaveHighlightMock.mockReturnValue({
    mutateAsync: save,
    isPending: saveIsPending,
  } as unknown as ReturnType<typeof useSaveHighlight>);
  useUpdateHighlightMock.mockReturnValue({
    mutateAsync: update,
    isPending: updateIsPending,
  } as unknown as ReturnType<typeof useUpdateHighlight>);
  return { save, update };
}

beforeEach(() => {
  vi.clearAllMocks();
  useDeleteHighlightMock.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useDeleteHighlight>);
});

describe("RegisterReadHighlights", () => {
  it("exclui um destaque", async () => {
    mockMutations();
    const deleteMutate = vi.fn();
    useDeleteHighlightMock.mockReturnValue({
      mutate: deleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteHighlight>);
    const user = userEvent.setup();

    render(<RegisterReadHighlights bookId="book-1" highlights={highlights} />);

    await user.click(screen.getByText("Excluir"));

    expect(deleteMutate).not.toHaveBeenCalled();

    const confirmButtons = screen.getAllByRole("button", { name: "Excluir" });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(deleteMutate.mock.calls[0][0]).toBe("hl-1");
  });

  it("mostra mensagem quando não há destaques", () => {
    mockMutations();
    render(<RegisterReadHighlights bookId="book-1" highlights={[]} />);

    expect(screen.getByText("Nenhum destaque ainda.")).toBeInTheDocument();
  });

  it("lista os destaques existentes", () => {
    mockMutations();
    render(
      <RegisterReadHighlights bookId="book-1" highlights={highlights} />,
    );

    expect(screen.getByText('"Uma frase marcante"')).toBeInTheDocument();
    expect(screen.getByText("pág 42")).toBeInTheDocument();
  });

  it("abre o formulário e salva um novo destaque", async () => {
    const user = userEvent.setup();
    const { save } = mockMutations();
    save.mockResolvedValue(undefined);

    render(<RegisterReadHighlights bookId="book-1" highlights={[]} />);

    await user.click(screen.getByText("Adicionar"));
    await user.type(screen.getByPlaceholderText("Citação"), "Nova citação");
    await user.type(screen.getByPlaceholderText("Número da página"), "10");
    await user.click(screen.getByText("Salvar"));

    expect(save).toHaveBeenCalledWith({ page: 10, quote: "Nova citação" });
    expect(toast.success).toHaveBeenCalledWith("Destaque salvo!");
  });

  it("mostra erro quando salvar o destaque falha", async () => {
    const user = userEvent.setup();
    const { save } = mockMutations();
    save.mockRejectedValue(new Error("falhou"));

    render(<RegisterReadHighlights bookId="book-1" highlights={[]} />);

    await user.click(screen.getByText("Adicionar"));
    await user.type(screen.getByPlaceholderText("Citação"), "Nova citação");
    await user.type(screen.getByPlaceholderText("Número da página"), "10");
    await user.click(screen.getByText("Salvar"));

    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível salvar o destaque. Tente novamente.",
    );
  });

  it("edita um destaque existente", async () => {
    const user = userEvent.setup();
    const { update } = mockMutations();
    update.mockResolvedValue(undefined);

    render(
      <RegisterReadHighlights bookId="book-1" highlights={highlights} />,
    );

    await user.click(screen.getByText("Editar"));
    const quoteField = screen.getByPlaceholderText("Citação");
    await user.clear(quoteField);
    await user.type(quoteField, "Frase corrigida");
    await user.click(screen.getByText("Salvar"));

    expect(update).toHaveBeenCalledWith({
      highlightId: "hl-1",
      page: 42,
      quote: "Frase corrigida",
    });
    expect(toast.success).toHaveBeenCalledWith("Destaque atualizado!");
  });

  it("mostra erro quando atualizar o destaque falha", async () => {
    const user = userEvent.setup();
    const { update } = mockMutations();
    update.mockRejectedValue(new Error("falhou"));

    render(
      <RegisterReadHighlights bookId="book-1" highlights={highlights} />,
    );

    await user.click(screen.getByText("Editar"));
    await user.click(screen.getByText("Salvar"));

    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível atualizar o destaque. Tente novamente.",
    );
  });

  it("cancela a edição de um destaque", async () => {
    const user = userEvent.setup();
    mockMutations();

    render(
      <RegisterReadHighlights bookId="book-1" highlights={highlights} />,
    );

    await user.click(screen.getByText("Editar"));
    expect(screen.getByPlaceholderText("Citação")).toBeInTheDocument();

    await user.click(screen.getByText("Cancelar"));
    expect(screen.queryByPlaceholderText("Citação")).not.toBeInTheDocument();
  });

  it("fecha o formulário de novo destaque ao clicar em Cancelar", async () => {
    const user = userEvent.setup();
    mockMutations();

    render(<RegisterReadHighlights bookId="book-1" highlights={[]} />);

    await user.click(screen.getByText("Adicionar"));
    expect(screen.getByPlaceholderText("Citação")).toBeInTheDocument();

    await user.click(screen.getByText("Cancelar"));
    expect(screen.queryByPlaceholderText("Citação")).not.toBeInTheDocument();
  });
});
