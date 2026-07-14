import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { TrackRead } from "./TrackRead";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

describe("TrackRead", () => {
  it("navega para a página de registro de leitura ao clicar", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <TrackRead bookId="book-1" />
      </MemoryRouter>,
    );

    await user.click(screen.getByText("Registro de leitura"));

    expect(navigateMock).toHaveBeenCalledWith("/livros/book-1/registro");
  });
});
