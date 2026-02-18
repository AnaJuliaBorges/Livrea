import { render, screen } from "@testing-library/react";
import { Button } from "./button";
import { expect, test } from "vitest";

test("Deve renderizar o botão com o texto correto", () => {
  render(<Button>Entrar no Livrea</Button>);
  const buttonElement = screen.getByText(/Entrar no Livrea/i);
  expect(buttonElement).toBeInTheDocument();
});
