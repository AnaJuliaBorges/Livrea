import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FilterChip } from "./FilterChip";

describe("FilterChip", () => {
  it("renderiza o rótulo e o ícone", () => {
    render(
      <FilterChip
        label="Lido"
        color="bg-success-light"
        icon={<span data-testid="tag-icon" />}
        active={false}
        onClick={() => {}}
      />,
    );

    expect(screen.getByText("Lido")).toBeInTheDocument();
    expect(screen.getByTestId("tag-icon")).toBeInTheDocument();
  });

  it("aplica a cor apenas quando está ativa", () => {
    const { rerender } = render(
      <FilterChip
        label="Lido"
        color="bg-success-light"
        icon={null}
        active={true}
        onClick={() => {}}
      />,
    );

    expect(screen.getByText("Lido")).toHaveClass("bg-success-light");

    rerender(
      <FilterChip
        label="Lido"
        color="bg-success-light"
        icon={null}
        active={false}
        onClick={() => {}}
      />,
    );

    expect(screen.getByText("Lido")).not.toHaveClass("bg-success-light");
  });

  it("chama onClick ao ser clicada", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <FilterChip
        label="Lendo"
        color="bg-warning-light"
        icon={null}
        active={false}
        onClick={onClick}
      />,
    );

    await user.click(screen.getByText("Lendo"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
