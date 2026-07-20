import type { Book } from "@/features/books";

export type SignUpWizardData = {
  step: number;

  // conta criada via OAuth: o passo 1 vira "complete seu perfil"
  googleSignUp?: boolean;

  account: {
    user_id: string;
    name: string;
    email: string;
    password: string;
    bio?: string;
    state_id: number;
    city_id: number;
    // foto vinda do Google, usada como preview inicial do avatar
    avatar_url?: string;
  };

  genres: number[];

  books: {
    read: Book[];
    wantRead: Book[];
  };
};
