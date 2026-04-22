import { createContext } from "react";
import type { SignUpWizardData } from "../types";

export type SignUpWizardContextType = {
  data: SignUpWizardData;
  update: <K extends keyof SignUpWizardData>(
    key: K,
    value: SignUpWizardData[K],
  ) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
};

export const SignUpWizardContext =
  createContext<SignUpWizardContextType | null>(null);
