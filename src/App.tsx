import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/clubes">Dashboard</Link>
        <Link to="/login">Login</Link>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
