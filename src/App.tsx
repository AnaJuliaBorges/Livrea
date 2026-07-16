import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "./components/LayoutWrapper";
import { Toaster } from "./components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ensurePushSubscription, getPushPermissionState } from "./lib/push";

export default function App() {
  // quem já deu permissão neste aparelho é re-inscrito silenciosamente a
  // cada abertura do app (cobre quem já estava logado antes do push existir
  // e inscrições que o navegador expirou). Quem nunca deu permissão é
  // convidado pelo botão na tela de notificações — nunca por prompt do nada.
  useEffect(() => {
    if (getPushPermissionState() === "granted") {
      void ensurePushSubscription();
    }
  }, []);

  return (
    <div>
      <main>
        <Layout>
          <Outlet />
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </Layout>
      </main>
    </div>
  );
}
