import { useNavigate } from "react-router-dom";
import logoText from "../../../assets/livrea_text_logo.png";
import { useLogin } from "../hooks/useLogin";
import { signInWithGoogle } from "../services/signInWithGoogle";
import { GoogleButton } from "../components/GoogleButton";
import { useState } from "react";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuthRedirect } from "../hooks/useAuthRedirect";

export default function Login() {
  useAuthRedirect("/clubes");

  const navigate = useNavigate();
  const { login, loading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // quem navega é o useAuthRedirect, ao receber o SIGNED_IN — navegar
      // aqui também criava uma corrida: este await termina depois (getUser
      // consulta profiles) e o navigate atrasado puxava o usuário de volta
    } catch {
      // erro já exibido pelo estado do useLogin
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleError(null);
    try {
      // volta para /login; o useAuthRedirect leva para /clubes ao
      // detectar a sessão criada pelo OAuth
      await signInWithGoogle("/login");
    } catch {
      setGoogleError("Não foi possível entrar com o Google. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col">
      <header className="grid grid-cols-3 items-center h-16">
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
          <img src={logoText} alt="Logo" className="h-[44]" />
        </div>
      </header>

      <Separator className="mb-8" />

      <p className="text-center text-2xl mb-8">Que bom te ver novamente!</p>

      <div className="flex w-full items-center justify-center">
        <div className="w-full max-w-sm">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FieldGroup className="flex flex-col gap-4">
              <Field>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Button
                type="button"
                className="self-start text-sm "
                variant="link"
                onClick={() => navigate("/recuperar-senha")}
              >
                Esqueci minha senha
              </Button>

              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground">ou</span>
                <Separator className="flex-1" />
              </div>

              <GoogleButton
                label="Continuar com Google"
                onClick={handleGoogleLogin}
              />

              {googleError && (
                <div className="bg-red-100 text-red-700 p-3 rounded">
                  {googleError}
                </div>
              )}
            </FieldGroup>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
              <Button
                type="submit"
                disabled={loading || password === "" || email === ""}
                className="w-full"
                onClick={() => handleSubmit}
              >
                Continuar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
