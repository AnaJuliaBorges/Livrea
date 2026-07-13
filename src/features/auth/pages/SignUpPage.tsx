import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { Button, Progress, Separator } from "@/components/ui";
import { useSignUpWizardStore } from "../signUp/store/useSignUpWizardStore";
import { useGoogleSignUpReturn } from "../signUp/hooks/useGoogleSignUpReturn";
import {
  FirstStep,
  GoogleFirstStep,
  SecondStep,
  ThirdStep,
  FourthStep,
} from "../signUp/steps";

export default function Signup() {
  const navigate = useNavigate();
  useGoogleSignUpReturn();

  const data = useSignUpWizardStore((state) => state.data);
  const stepButton = useSignUpWizardStore((state) => state.stepButton);

  const steps = [
    data.googleSignUp ? GoogleFirstStep : FirstStep,
    SecondStep,
    ThirdStep,
    FourthStep,
  ];

  const CurrentStep = steps[data.step - 1];

  const titleMap: Record<number, string> = {
    1: data.googleSignUp
      ? "Complete seu perfil"
      : "Olá, boas vindas ao Livrea!",
    2: "Selecione os gêneros que mais gosta",
    3: "Selecione os livros que já leu",
    4: "Selecione os livros que deseja ler",
  };

  return (
    <div className="flex flex-col">
      <header className="flex items-center h-16 px-4 gap-4">
        <div>
          <Button
            className="w-content"
            variant="link"
            onClick={() => navigate("/")}
          >
            <ArrowLeftIcon />
          </Button>
        </div>

        <Progress value={30 * (data.step - 1)} />
      </header>

      <Separator className="mb-8" />

      <p className="text-center text-2xl mb-8">{titleMap[data.step]}</p>

      <div className="flex w-full items-center justify-center">
        <div className="w-full max-w-sm mb-20">
          <CurrentStep />
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%]">
        <Button
          type="submit"
          form="signup-step-form"
          disabled={stepButton.disabled}
          className="w-full"
        >
          {stepButton.label ?? "Continuar"}
        </Button>
      </div>
    </div>
  );
}
