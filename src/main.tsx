import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "@/features/auth/pages/LoginPage";
import { protectedLoader } from "./routes/ProtectedRoute";
import App from "./App";

import "./index.css";
import ListClubs from "./features/clubs/pages/ListClubs";
import Home from "./features/auth/pages/Home";
import Signup from "./features/auth/pages/SignUpPage";
import MyClubs from "./features/clubs/pages/MyClubs";
import Profile from "./features/profile/pages/Profile";
import CreateClub from "./features/clubs/pages/CreateClub";
import ListBooks from "./features/books/pages/ListBooks";
import { BookDetail } from "./features/books/pages/BookDetail";
import { EditProfile } from "./features/profile/pages/EditProfile";
import RegisterRead from "./features/books/pages/RegisterRead";
import ClubDetails from "./features/clubs/pages/ClubDetails";

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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "cadastrar",
        element: <Signup />,
      },
      {
        path: "clubes",
        element: <ListClubs />,
        loader: protectedLoader,
      },
      {
        path: "clubes/:id",
        element: <ClubDetails />,
        loader: protectedLoader,
      },
      {
        path: "meus-clubes/criar",
        element: <CreateClub />,
        loader: protectedLoader,
      },
      {
        path: "meus-clubes",
        element: <MyClubs />,
        loader: protectedLoader,
      },
      {
        path: "livros",
        element: <ListBooks />,
        loader: protectedLoader,
      },
      {
        path: "livros/:id",
        element: <BookDetail />,
        loader: protectedLoader,
      },
      {
        path: "livros/:id/registro",
        element: <RegisterRead />,
        loader: protectedLoader,
      },
      {
        path: "perfil",
        element: <Profile />,
        loader: protectedLoader,
      },
      {
        path: "perfil/editar",
        element: <EditProfile />,
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
