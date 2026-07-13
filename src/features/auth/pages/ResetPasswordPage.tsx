import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logoText from "../../../assets/livrea_text_logo.png";
import { supabase } from "@/lib/supabase";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { updatePassword } from "../services/passwordReset";

// O link do email abre esta página; o Supabase troca o token da URL por
// uma sessão de recuperação — só então dá para salvar a nova senha.
type LinkState = "checking" | "ready" | "invalid";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [linkState, setLinkState] = useState<LinkState>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setLinkState("ready");
    });

    // a troca do token da URL pela sessão acontece depois do mount
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setLinkState("ready");
    });

    const timer = setTimeout(() => {
      setLinkState((state) => (state === "checking" ? "invalid" : state));
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (password !== confirmation) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      toast.success("Senha atualizada!");
      navigate("/clubes");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar a senha. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <header className="grid grid-cols-3 items-center h-16 px-4">
        <div />
        <div className="justify-self-center">
          <img src={logoText} alt="Logo" className="h-[44]" />
        </div>
      </header>

      <Separator className="mb-8" />

      <p className="text-center text-2xl mb-4">Redefinir senha</p>

      <div className="flex w-full items-center justify-center">
        <div className="w-full max-w-sm">
          {linkState === "checking" && (
            <p className="text-center text-sm text-muted-foreground">
              Validando o link...
            </p>
          )}

          {linkState === "invalid" && (
            <div className="flex flex-col gap-6 text-center">
              <p className="text-sm text-muted-foreground">
                Link inválido ou expirado. Solicite um novo link de
                recuperação.
              </p>
              <Button onClick={() => navigate("/recuperar-senha")}>
                Solicitar novo link
              </Button>
            </div>
          )}

          {linkState === "ready" && (
            <>
              <p className="text-center text-sm text-muted-foreground mb-8">
                Escolha sua nova senha.
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
                      id="password"
                      type="password"
                      placeholder="Nova senha"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <Input
                      id="confirmation"
                      type="password"
                      placeholder="Confirme a nova senha"
                      required
                      onChange={(e) => setConfirmation(e.target.value)}
                    />
                  </Field>
                </FieldGroup>

                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
                  <Button
                    type="submit"
                    disabled={loading || password === "" || confirmation === ""}
                    className="w-full"
                  >
                    {loading ? "Salvando..." : "Salvar nova senha"}
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
