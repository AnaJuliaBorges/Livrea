import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "@/features/auth/pages/LoginPage";
import { protectedLoader } from "./routes/ProtectedRoute";
import App from "./App";

import "./index.css";
import ListClubs from "./features/clubs/pages/listClubs";
import Home from "./features/auth/pages/Home";
import { SignUpWizardProvider } from "./features/auth/signUp/context/SignUpWizardProvider";
import Signup from "./features/auth/pages/SignUpPage";
import MyClubs from "./features/clubs/pages/myClubs";
import Profile from "./features/profile/pages/profile";
import CreateClub from "./features/clubs/pages/createClub";
import ListBooks from "./features/books/pages/listBooks";
import { BookDetail } from "./features/books/pages/bookDetail";
import { EditProfile } from "./features/profile/pages/editProfile";
import RegisterRead from "./features/books/pages/registerRead";

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
        element: (
          <SignUpWizardProvider>
            <Signup />
          </SignUpWizardProvider>
        ),
      },
      {
        path: "clubes",
        element: <ListClubs />,
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
