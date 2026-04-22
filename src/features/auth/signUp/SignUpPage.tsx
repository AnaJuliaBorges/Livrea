import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { Button, Progress, Separator } from "@/components/ui";

import FirstStep from "./steps/FirstStep";
import SecondStep from "./steps/SecondStep";
import FourthStep from "./steps/FourthStep";
import ThirdStep from "./steps/ThirdStep";

import { useSignUpWizardContext } from "./context/useSignupWizardContext";

export default function Signup() {
  const navigate = useNavigate();

  const { data, update, nextStep } = useSignUpWizardContext();

  const steps = [FirstStep, SecondStep, ThirdStep, FourthStep];

  const CurrentStep = steps[data.step - 1];

  const titleMap: Record<number, string> = {
    1: "Olá, boas vindas ao Livrea!",
    2: "Selecione os gêneros que mais gosta",
    3: "Selecione os livros que já leu",
    4: "Selecione os livros que deseja ler",
  };

  return (
    <div className="flex flex-col h-svh mb-20">
      <header className="grid grid-cols-3 items-center h-16 px-4">
        <div>
          <Button
            className="w-content"
            variant="link"
            onClick={() => navigate("/")}
          >
            <ArrowLeftIcon />
          </Button>
        </div>

        <div className="justify-self-center">
          <Progress value={25 * (data.step - 1)} className="w-[60%]" />
        </div>
      </header>

      <Separator className="mb-8" />

      <p className="text-center text-2xl mb-8">{titleMap[data.step]}</p>

      <div className="flex w-full items-center justify-center">
        <div className="w-full max-w-sm mb-10">
          <CurrentStep data={data} update={update} nextStep={nextStep} />
        </div>
      </div>
    </div>
  );
}
