import type { Book } from "@/features/books";

export type SignUpWizardData = {
  step: number;

  googleSignUp?: boolean;

  account: {
    user_id: string;
    name: string;
    email: string;
    password: string;
    bio?: string;
    state_id: number;
    city_id: number;
    avatar_url?: string;
  };

  genres: number[];

  books: {
    read: Book[];
    wantRead: Book[];
  };
};
