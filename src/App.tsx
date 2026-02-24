import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import { Layout } from "./components/layoutWrapper";

export default function App() {
  return (
    <div>
      <Header />

      <main>
        <Layout>
          <Outlet />
        </Layout>
      </main>
    </div>
  );
}
