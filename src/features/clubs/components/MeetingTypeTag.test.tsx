import { render, screen } from "@testing-library/react";
import { MeetingTypeTag } from "./MeetingTypeTag";

describe("MeetingTypeTag", () => {
  it.each([
    ["in_person", "Presencial"],
    ["online", "Online"],
    ["hybrid", "Híbrido"],
  ])("mostra o rótulo do tipo %s", (type, label) => {
    render(<MeetingTypeTag type={type} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("não renderiza nada para um tipo desconhecido", () => {
    const { container } = render(<MeetingTypeTag type="carrier_pigeon" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("aplica o estilo soft quando pedido", () => {
    render(<MeetingTypeTag type="online" variant="soft" />);
    const tag = screen.getByText("Online").closest("span");
    expect(tag).toHaveClass("text-gray-500");
  });
});
