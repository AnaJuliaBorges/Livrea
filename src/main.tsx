import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "@/features/auth/pages/LoginPage";
import { protectedLoader, publicOnlyLoader } from "./routes/guards";
import { AppLayout, AuthLayout } from "./components/layout/LayoutWrapper";
import { RouteError } from "./components/layout/RouteError";
import { createAppQueryClient } from "./lib/queryClient";
import { initSentry } from "./lib/sentry";
import App from "./App";

import "./index.css";
import Home from "./features/auth/pages/Home";

// antes de tudo, pra capturar erro que aconteça já na montagem
initSentry();

// config + funil global de erro de query/mutation em lib/queryClient.ts
const queryClient = createAppQueryClient();

// Home e Login ficam no bundle inicial (primeiro paint do visitante); o
// resto vira chunk por página via `lazy` do data router — o loader
// (proteção de rota) continua estático e roda em paralelo com o import.
function lazyPage(
  importer: () => Promise<{ default: React.ComponentType }>,
): () => Promise<{ Component: React.ComponentType }> {
  return async () => ({ Component: (await importer()).default });
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // na raiz: cobre erro de render/loader de qualquer rota filha e também
    // as rotas que não existem (404), que não casam com nenhum path abaixo
    errorElement: <RouteError />,
    children: [
      {
        // visitante: shell sem MenuBar
        element: <AuthLayout />,
        children: [
          { index: true, element: <Home />, loader: publicOnlyLoader },
          {
            path: "login",
            element: <Login />,
            loader: publicOnlyLoader,
          },
          {
            path: "cadastrar",
            lazy: lazyPage(() => import("./features/auth/pages/SignUpPage")),
          },
          {
            path: "recuperar-senha",
            lazy: lazyPage(
              () => import("./features/auth/pages/ForgotPasswordPage"),
            ),
          },
          {
            path: "redefinir-senha",
            lazy: lazyPage(
              () => import("./features/auth/pages/ResetPasswordPage"),
            ),
          },
        ],
      },
      {
        // app logado: shell com MenuBar (rodapé no mobile, topo no desktop)
        element: <AppLayout />,
        children: [
          {
            path: "feed",
            lazy: lazyPage(() => import("./features/feed/pages/Feed")),
            loader: protectedLoader,
          },
          {
            path: "clubes",
            lazy: lazyPage(() => import("./features/clubs/pages/ListClubs")),
            loader: protectedLoader,
          },
          {
            path: "clubes/:id",
            lazy: lazyPage(() => import("./features/clubs/pages/ClubDetails")),
            loader: protectedLoader,
          },
          {
            path: "clubes/:id/configuracoes",
            lazy: lazyPage(() => import("./features/clubs/pages/ClubSettings")),
            loader: protectedLoader,
          },
          {
            path: "clubes/:id/chat",
            lazy: lazyPage(() => import("./features/chat/pages/ClubChat")),
            loader: protectedLoader,
          },
          {
            path: "meus-clubes/criar",
            lazy: lazyPage(() => import("./features/clubs/pages/CreateClub")),
            loader: protectedLoader,
          },
          {
            path: "meus-clubes",
            lazy: lazyPage(() => import("./features/clubs/pages/MyClubs")),
            loader: protectedLoader,
          },
          {
            path: "livros",
            lazy: lazyPage(() => import("./features/books/pages/ListBooks")),
            loader: protectedLoader,
          },
          {
            path: "livros/:id",
            lazy: async () => ({
              Component: (await import("./features/books/pages/BookDetail"))
                .BookDetail,
            }),
            loader: protectedLoader,
          },
          {
            path: "livros/:id/registro",
            lazy: lazyPage(() => import("./features/books/pages/RegisterRead")),
            loader: protectedLoader,
          },
          {
            path: "perfil",
            lazy: lazyPage(() => import("./features/profile/pages/Profile")),
            loader: protectedLoader,
          },
          {
            path: "notificacoes",
            lazy: lazyPage(
              () => import("./features/notifications/pages/Notifications"),
            ),
            loader: protectedLoader,
          },
          {
            path: "perfil/editar",
            lazy: async () => ({
              Component: (await import("./features/profile/pages/EditProfile"))
                .EditProfile,
            }),
            loader: protectedLoader,
          },
          {
            path: "perfil/:id",
            lazy: lazyPage(() => import("./features/profile/pages/Profile")),
            loader: protectedLoader,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
);
