import { Outlet } from "react-router-dom";
import { Layout } from "./components/layoutWrapper";

export default function App() {
  return (
    <div>
      <main>
        <Layout>
          <Outlet />
        </Layout>
      </main>
    </div>
  );
}
