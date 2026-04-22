import { type PropsWithChildren } from "react";
import { useSignUpWizard as useWizardHook } from "../hooks/useSignUpWizard";
import { SignUpWizardContext } from "./SignUpWizardContext";

export function SignUpWizardProvider({ children }: PropsWithChildren) {
  const wizard = useWizardHook();

  return (
    <SignUpWizardContext.Provider value={wizard}>
      {children}
    </SignUpWizardContext.Provider>
  );
}
