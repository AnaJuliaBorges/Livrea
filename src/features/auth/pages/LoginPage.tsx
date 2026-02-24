import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/loginForm";
import { useLogin } from "../hooks/useLogin";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/clubes");
    } catch (err) {
      // Erro já está em `error`
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <LoginForm
          onSubmit={handleSubmit}
          setEmail={setEmail}
          setPassword={setPassword}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
