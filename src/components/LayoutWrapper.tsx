import React from "react";
import { useLocation } from "react-router-dom";
import MenuBar from "./MenuBar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

// Rotas de visitante: sem MenuBar — todos os links dele são rotas
// protegidas e, no mobile, o menu fixo do rodapé cobria o botão
// "Continuar" do login.
const AUTH_ROUTES = [
  "/",
  "/login",
  "/cadastrar",
  "/recuperar-senha",
  "/redefinir-senha",
];

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/20">
      <main
        className={cn(
          "mx-auto max-w-3xl px-4 pt-4 pb-10 sm:px-6 lg:max-w-7xl",
          !isAuthRoute && "md:pt-32 lg:pb-6",
        )}
      >
        {children}
      </main>

      {!isAuthRoute && <MenuBar />}
    </div>
  );
}
