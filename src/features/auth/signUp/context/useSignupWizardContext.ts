import { useContext } from "react";
import { SignUpWizardContext } from "./SignUpWizardContext";

export function useSignUpWizardContext() {
  const context = useContext(SignUpWizardContext);

  if (!context) {
    throw new Error(
      "useSignUpWizardContext must be used within SignUpWizardProvider",
    );
  }

  return context;
}
