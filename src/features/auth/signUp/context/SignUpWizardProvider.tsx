import { createContext, type PropsWithChildren } from "react";
import { useSignUpWizard as useWizardHook } from "../hooks/useSignUpWizard";
import type { SignUpWizardData } from "../types";

type SignUpWizardContextType = {
  data: SignUpWizardData;
  update: <K extends keyof SignUpWizardData>(
    key: K,
    value: SignUpWizardData[K],
  ) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
};

const SignUpWizardContext = createContext<SignUpWizardContextType | null>(null);

export function SignUpWizardProvider({ children }: PropsWithChildren) {
  const wizard = useWizardHook();

  return (
    <SignUpWizardContext.Provider value={wizard}>
      {children}
    </SignUpWizardContext.Provider>
  );
}
