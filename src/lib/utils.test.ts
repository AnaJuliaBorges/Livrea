import { describe, it, expect } from "vitest";
import { getErrorMessage } from "./utils";

describe("getErrorMessage", () => {
  it("extrai a mensagem de um objeto plano vindo de supabase.rpc (não é instância de Error)", () => {
    const error = {
      message: "Apenas o administrador pode editar o clube",
      details: "",
      hint: "",
      code: "P0001",
    };

    expect(getErrorMessage(error)).toBe(
      "Apenas o administrador pode editar o clube",
    );
  });

  it("extrai a mensagem de uma instância real de Error", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("retorna null quando message é uma string vazia", () => {
    expect(getErrorMessage({ message: "" })).toBeNull();
  });

  it("retorna null quando não há campo message", () => {
    expect(getErrorMessage({ details: "algo" })).toBeNull();
  });

  it("retorna null para valores não-objeto", () => {
    expect(getErrorMessage(null)).toBeNull();
    expect(getErrorMessage(undefined)).toBeNull();
    expect(getErrorMessage("string error")).toBeNull();
  });
});
