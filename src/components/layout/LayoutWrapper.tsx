import { Outlet } from "react-router-dom";
import { WelcomeTour } from "@/features/onboarding";
import MenuBar from "./MenuBar";

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

      {/* primeiro acesso do shell logado (e reabertura via ?tour=1) */}
      <WelcomeTour />
    </div>
  );
}
