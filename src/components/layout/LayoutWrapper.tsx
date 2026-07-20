import { Outlet } from "react-router-dom";
import MenuBar from "./MenuBar";

// Layouts de rota (pathless) declarados em src/main.tsx — a decisão de qual
// shell usar vive no router, não numa lista de pathnames duplicada aqui.

// Rotas de visitante: sem MenuBar — todos os links dele são rotas
// protegidas e, no mobile, o menu fixo do rodapé cobria o botão
// "Continuar" do login.
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface selection:bg-primary/20">
      <main className="mx-auto max-w-3xl px-4 pt-4 pb-10 sm:px-6 lg:max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface selection:bg-primary/20">
      <main className="mx-auto max-w-3xl px-4 pt-4 pb-10 sm:px-6 lg:max-w-7xl md:pt-32 lg:pb-6">
        <Outlet />
      </main>

      <MenuBar />
    </div>
  );
}
