import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "@/features/auth/pages/LoginPage";
import { protectedLoader } from "./routes/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    // element: <>Layout</>,
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

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
);
