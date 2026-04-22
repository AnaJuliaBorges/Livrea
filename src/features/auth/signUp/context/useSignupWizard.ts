import { useContext } from "react";
import { SignupWizardContext } from "./SignUpWizardContext";

export function useSignupWizard() {
  const context = useContext(SignupWizardContext);

  if (!context) {
    throw new Error("useSignupWizard must be used within provider");
  }

  return context;
}
