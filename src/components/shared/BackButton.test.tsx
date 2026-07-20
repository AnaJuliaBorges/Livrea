import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BackButton } from "./BackButton";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

beforeEach(() => {
  navigateMock.mockReset();
});

describe("BackButton", () => {
  it("navega para a página anterior ao ser clicado", async () => {
    const user = userEvent.setup();
    render(<BackButton />);

    await user.click(screen.getByRole("button"));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
