import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "@/features/auth/pages/LoginPage";
// import { protectedLoader } from "./routes/ProtectedRoute";
import App from "./App";

import "./index.css";
import ListClubs from "./features/clubs/pages/listClubs";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "clubes",
        element: <ListClubs />,
        // loader: protectedLoader,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
);
