import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import logoText from "../../../assets/livrea_text_logo.png";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { requestPasswordReset } from "../services/passwordReset";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch {
      setError("Não foi possível enviar o email. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <header className="grid grid-cols-3 items-center h-16 px-4">
        <div>
          <Button
            className="w-content"
            variant="link"
            onClick={() => navigate("/login")}
          >
            <ArrowLeftIcon />
          </Button>
        </div>

        <div className="justify-self-center">
          <img src={logoText} alt="Logo" className="h-[44]" />
        </div>
      </header>

      <Separator className="mb-8" />

      <p className="text-center text-2xl mb-4">Recuperar senha</p>

      <div className="flex w-full items-center justify-center">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="flex flex-col gap-6 text-center">
              <p className="text-sm text-muted-foreground">
                Se existir uma conta com o email <strong>{email}</strong>, você
                receberá um link para redefinir sua senha. Confira também a
                caixa de spam.
              </p>
              <Button onClick={() => navigate("/login")}>
                Voltar para o login
              </Button>
            </div>
          ) : (
            <>
              <p className="text-center text-sm text-muted-foreground mb-8">
                Informe seu email e enviaremos um link para você redefinir sua
                senha.
              </p>

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
                </FieldGroup>

                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
                  <Button
                    type="submit"
                    disabled={loading || email === ""}
                    className="w-full"
                  >
                    {loading ? "Enviando..." : "Enviar link"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
