import { useSignUpWizardStore } from "./useSignUpWizardStore";

describe("useSignUpWizardStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useSignUpWizardStore.getState().reset();
  });

  it("não persiste a senha no localStorage", () => {
    useSignUpWizardStore.getState().update("account", {
      user_id: "",
      name: "Ana",
      email: "ana@example.com",
      password: "supersecreta",
      bio: "",
      state_id: 1,
      city_id: 2,
    });

    const persisted = localStorage.getItem("signup_wizard");
    expect(persisted).toContain("ana@example.com");
    expect(persisted).not.toContain("supersecreta");
  });

  it("mantém a senha em memória para o submit do passo 1", () => {
    useSignUpWizardStore.getState().update("account", {
      ...useSignUpWizardStore.getState().data.account,
      password: "supersecreta",
    });

    expect(useSignUpWizardStore.getState().data.account.password).toBe(
      "supersecreta",
    );
  });
});
