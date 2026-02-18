import { createBrowserRouter } from "react-router-dom";
import { protectedLoader } from "./ProtectedRoute";
import Login from "@/features/auth/pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <>Layout</>,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "clubes",
        element: <>Lista de clubes</>,
        loader: protectedLoader,
      },
    ],
  },
]);
