import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, SquareCheck } from "lucide-react";
import { Button, Progress, Separator } from "@/components/ui";
import { FirstStep, SecondStep, ThirdStep, FourthStep } from "../steps/index";
import { useCreateClubStore } from "../store/useCreateClubStore";

const steps = [
  {
    title: "Configurações iniciais do seu Clube do Livro",
  },
  {
    title: "Configure como serão os encontros do clube",
  },
  {
    title: "Defina o acesso ao seu clube",
  },
  {
    title: "Selecione os gêneros do seu clube",
  },
];

const stepComponents = [FirstStep, SecondStep, ThirdStep, FourthStep];

export default function CreateClub() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showValidation, setShowValidation] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const clubName = useCreateClubStore((state) => state.clubName);
  const description = useCreateClubStore((state) => state.description);
  const rules = useCreateClubStore((state) => state.rules);
  const frequency = useCreateClubStore((state) => state.frequency);
  const reset = useCreateClubStore((state) => state.reset);
  const customFrequency = useCreateClubStore((state) => state.customFrequency);
  const state = useCreateClubStore((state) => state.state);
  const city = useCreateClubStore((state) => state.city);
  const privacy = useCreateClubStore((state) => state.privacy);
  const hasLimit = useCreateClubStore((state) => state.hasLimit);
  const maxParticipants = useCreateClubStore((state) => state.maxParticipants);
  const selectedGenres = useCreateClubStore((state) => state.selectedGenres);

  const currentStep = steps[step - 1];
  const isLastStep = step === steps.length;
  const CurrentStepComponent = stepComponents[step - 1];

  const isStepValid = () => {
    if (step === 1) {
      return Boolean(clubName.trim() && description.trim() && rules.trim());
    }

    if (step === 2) {
      if (!frequency) return false;
      if (frequency === "outro" && !customFrequency.trim()) return false;
      if (!state || !city) return false;
      return true;
    }

    if (step === 3) {
      if (!privacy || !hasLimit) return false;
      if (hasLimit === "sim" && !maxParticipants) return false;
      return true;
    }

    return selectedGenres.length > 0;
  };

  const handleContinue = () => {
    if (!isStepValid()) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);

    if (isLastStep) {
      reset();
      setStep(1);
      setShowValidation(false);
      setIsSuccess(true);
      return;
    }

    setStep((prev) => prev + 1);
  };

  const validationMessage = {
    1: "Preencha o nome, a descrição e as regras para continuar.",
    2: "Selecione a frequência, o estado, a cidade e, se necessário, a frequência personalizada.",
    3: "Defina a privacidade, o limite de participantes e, se houver limite, a quantidade máxima.",
    4: "Selecione pelo menos um gênero para continuar.",
  }[step];

  const handleFinish = () => {
    reset();
    navigate("/clubes");
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-secondary">
        <div className="flex flex-col w-full items-center justify-center px-4 text-center gap-6 text-white">
          <SquareCheck size={62} />
          <div>
            <h2 className="text-2xl mb-2">Tudo certo!</h2>
            <p>
              Seu Clube do Livro: Capítulo à Três foi criado com sucesso. Agora
              você pode gerenciar ele quando quiser na sua página de clubes.
            </p>
          </div>
        </div>

        <div className="fixed bottom-18 left-0 right-0 z-40 py-5 px-4 backdrop-blur">
          <Button
            onClick={handleFinish}
            className="w-full bg-white text-foreground"
          >
            Ver clube
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-4">
      <header className="flex items-center h-16 gap-4">
        <div>
          <Button
            className="w-content"
            variant="link"
            onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
            disabled={step === 1}
          >
            <ArrowLeftIcon className="text-secondary" />
          </Button>
        </div>

        <Progress value={((step - 1) / (steps.length - 1)) * 100} />
      </header>

      <Separator className="mb-8" />

      <p className="text-center text-2xl mb-8">{currentStep.title}</p>

      <div className="flex w-full items-center justify-center">
        <div className="w-full max-w-sm mb-20">
          <CurrentStepComponent
            showValidation={showValidation && !isStepValid()}
          />

          <div className="fixed bottom-18 left-0 right-0 z-40 py-3 px-4 backdrop-blur">
            {showValidation && !isStepValid() && (
              <p className="mb-2 text-center text-sm text-red-500">
                {validationMessage}
              </p>
            )}

            <Button
              onClick={handleContinue}
              disabled={!isStepValid()}
              className="w-full"
            >
              {isLastStep ? "Criar clube" : "Continuar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
