import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/shared/GoogleIcon";
import logo from "../../../assets/livrea_logo_purple_sem_fundo.png";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../services/signInWithGoogle";

export default function Home() {
  const navigate = useNavigate();
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setGoogleError(null);
    try {
      await signInWithGoogle("/login");
    } catch {
      setGoogleError("Não foi possível entrar com o Google. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col gap-8 justify-center items-center h-[90vh]">
      <img src={logo} alt="Logo" width={144} />
      <p className="text-center max-w-sm text-sm">
        Aqui você poderá participar de clubes do livro de acordo com seu gosto,
        disponibilidade e interesse. Aproveite o melhor da literatura trocando
        com outras pessoas!
      </p>
      <div className="flex flex-col gap-4 w-full max-w-sm ">
        <Button onClick={() => navigate("/login")}>Entrar</Button>
        <Button variant="outline" onClick={() => navigate("/cadastrar")}>
          Cadastrar
        </Button>
      </div>
      <p className="text-sm">Ou continue com</p>
      <Button
        variant="outline"
        className="w-full max-w-sm cursor-pointer"
        aria-label="Entrar com o Google"
        onClick={handleGoogleLogin}
      >
        <GoogleIcon />
      </Button>
      {googleError && (
        <div className="bg-red-100 text-red-700 p-3 rounded max-w-sm">
          {googleError}
        </div>
      )}
    </div>
  );
}
