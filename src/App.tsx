import { Outlet } from "react-router-dom";
import { Layout } from "./components/LayoutWrapper";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <div>
      <main>
        <Layout>
          <Outlet />
          <Toaster />
        </Layout>
      </main>
    </div>
  );
}
