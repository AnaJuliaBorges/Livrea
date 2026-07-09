import { Outlet } from "react-router-dom";
import { Layout } from "./components/layoutWrapper";
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
