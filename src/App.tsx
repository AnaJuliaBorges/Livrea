import { Outlet } from "react-router-dom";
import { Layout } from "./components/LayoutWrapper";
import { Toaster } from "./components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function App() {
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
