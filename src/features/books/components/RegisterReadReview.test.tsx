import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import RegisterReadReview from "./RegisterReadReview";
import { useDeleteReview, useSaveReview } from "../hooks/useReadingTracking";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../hooks/useReadingTracking");

const useSaveReviewMock = vi.mocked(useSaveReview);

function mockMutation({ save = vi.fn(), isPending = false } = {}) {
  useSaveReviewMock.mockReturnValue({
    mutateAsync: save,
    isPending,
  } as unknown as ReturnType<typeof useSaveReview>);
  return save;
}

const useDeleteReviewMock = vi.mocked(useDeleteReview);

beforeEach(() => {
  vi.clearAllMocks();
  useDeleteReviewMock.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useDeleteReview>);
});

describe("RegisterReadReview", () => {
  it("exclui a avaliação após confirmar no modal", async () => {
    mockMutation();
    const deleteMutate = vi.fn();
    useDeleteReviewMock.mockReturnValue({
      mutate: deleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteReview>);
    const user = userEvent.setup();

    render(
      <RegisterReadReview bookId="book-1" rating={4} review="Muito bom!" />,
    );

    await user.click(screen.getByText("Excluir avaliação"));

    expect(
      screen.getByText(/nota e resenha deste livro serão apagadas/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Excluir" }));

    expect(deleteMutate).toHaveBeenCalledTimes(1);
  });

  it("cancelar o modal não exclui nada", async () => {
    mockMutation();
    const deleteMutate = vi.fn();
    useDeleteReviewMock.mockReturnValue({
      mutate: deleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteReview>);
    const user = userEvent.setup();

    render(
      <RegisterReadReview bookId="book-1" rating={4} review="Muito bom!" />,
    );

    await user.click(screen.getByText("Excluir avaliação"));
    await user.click(screen.getByText("Cancelar"));

    expect(deleteMutate).not.toHaveBeenCalled();
    expect(
      screen.queryByText(/nota e resenha deste livro serão apagadas/),
    ).not.toBeInTheDocument();
  });

  it("mostra o formulário de nova avaliação quando ainda não há avaliação", () => {
    mockMutation();

    render(<RegisterReadReview bookId="book-1" rating={null} review={null} />);

    expect(screen.getByText("Fazer avaliação")).toBeInTheDocument();
    expect(screen.getByText("Salvar avaliação")).toBeDisabled();
  });

  it("salva uma nova avaliação com nota e texto", async () => {
    const user = userEvent.setup();
    const save = mockMutation();
    save.mockResolvedValue(undefined);

    render(<RegisterReadReview bookId="book-1" rating={null} review={null} />);

    await user.click(screen.getByLabelText("4 estrelas"));
    await user.type(
      screen.getByPlaceholderText("O que você achou do livro?"),
      "Muito bom!",
    );
    await user.click(screen.getByText("Salvar avaliação"));

    expect(save).toHaveBeenCalledWith({ rating: 4, review: "Muito bom!" });
    expect(toast.success).toHaveBeenCalledWith("Avaliação salva!");
  });

  it("mostra erro quando salvar falha", async () => {
    const user = userEvent.setup();
    const save = mockMutation();
    save.mockRejectedValue(new Error("falhou"));

    render(<RegisterReadReview bookId="book-1" rating={null} review={null} />);

    await user.click(screen.getByLabelText("3 estrelas"));
    await user.click(screen.getByText("Salvar avaliação"));

    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível salvar a avaliação. Tente novamente.",
    );
  });

  it("mostra a avaliação salva quando já existe", () => {
    mockMutation();

    render(
      <RegisterReadReview bookId="book-1" rating={4.5} review="Excelente!" />,
    );

    expect(screen.getByText("Sua avaliação")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText('"Excelente!"')).toBeInTheDocument();
  });

  it("abre a edição pré-preenchida e permite cancelar", async () => {
    const user = userEvent.setup();
    mockMutation();

    render(
      <RegisterReadReview bookId="book-1" rating={4} review="Bom livro" />,
    );

    await user.click(screen.getByText("Editar avaliação"));

    expect(
      screen.getByPlaceholderText("O que você achou do livro?"),
    ).toHaveValue("Bom livro");

    await user.click(screen.getByText("Cancelar"));

    expect(screen.getByText("Sua avaliação")).toBeInTheDocument();
  });

  it("considera que há avaliação quando só a nota está presente", () => {
    mockMutation();

    render(<RegisterReadReview bookId="book-1" rating={3} review={null} />);

    expect(screen.getByText("Sua avaliação")).toBeInTheDocument();
  });
});
