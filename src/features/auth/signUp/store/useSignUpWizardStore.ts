import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SignUpWizardData } from "../model";

type StepButtonState = {
  label?: string;
  disabled: boolean;
};

type SignUpWizardStore = {
  data: SignUpWizardData;
  stepButton: StepButtonState;
  setStepButton: (stepButton: StepButtonState) => void;
  update: <K extends keyof SignUpWizardData>(
    key: K,
    value: SignUpWizardData[K],
  ) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
};

const initialData: SignUpWizardData = {
  step: 1,
  googleSignUp: false,
  account: {
    user_id: "",
    name: "",
    email: "",
    password: "",
    bio: "",
    state_id: 0,
    city_id: 0,
  },
  genres: [],
  books: { read: [], wantRead: [] },
};

export const useSignUpWizardStore = create<SignUpWizardStore>()(
  persist(
    (set) => ({
      data: initialData,
      stepButton: { disabled: true },
      setStepButton: (stepButton) => set({ stepButton }),
      update: (key, value) =>
        set((state) => ({ data: { ...state.data, [key]: value } })),
      nextStep: () =>
        set((state) => ({
          data: { ...state.data, step: state.data.step + 1 },
        })),
      prevStep: () =>
        set((state) => ({
          data: { ...state.data, step: state.data.step - 1 },
        })),
      reset: () => set({ data: initialData }),
    }),
    {
      name: "signup_wizard",
      // só os dados do wizard vão pro localStorage; estado de UI não
      partialize: (state) => ({ data: state.data }),
    },
  ),
);
