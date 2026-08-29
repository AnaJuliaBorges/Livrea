import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ensurePushSubscription, getPushPermissionState } from "./lib/push";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  useEffect(() => {
    if (getPushPermissionState() === "granted") {
      void ensurePushSubscription();
    }
  }, []);

  return (
    <>
      <ScrollToTop />
      <Outlet />
      <Toaster />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
