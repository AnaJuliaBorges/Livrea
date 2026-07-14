import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SafeHtml } from "./SafeHtml";

describe("SafeHtml", () => {
  it("renderiza tags de formatação", () => {
    render(
      <SafeHtml html="<p>Um clássico de <b>Tolkien</b> com <i>hobbits</i>.</p>" />,
    );

    expect(screen.getByText("Tolkien").tagName).toBe("B");
    expect(screen.getByText("hobbits").tagName).toBe("I");
  });

  it("remove scripts e handlers de evento", () => {
    const { container } = render(
      <SafeHtml html='<p>Sinopse</p><script>alert("xss")</script><img src="x" onerror="alert(1)" />' />,
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Sinopse")).toBeInTheDocument();
  });

  it("remove links e atributos, mantendo o texto", () => {
    const { container } = render(
      <SafeHtml html='<a href="https://evil.example.com">O Hobbit</a>' />,
    );

    expect(container.querySelector("a")).toBeNull();
    expect(screen.getByText("O Hobbit")).toBeInTheDocument();
  });

  it("aplica a className no wrapper", () => {
    const { container } = render(
      <SafeHtml html="<p>texto</p>" className="text-xs" />,
    );

    expect(container.firstChild).toHaveClass("text-xs");
  });
});
