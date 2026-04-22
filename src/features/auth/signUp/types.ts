export type SignUpWizardData = {
  step: number;

  account: {
    name: string;
    email: string;
    password: string;
    bio?: string;
    state_id: number;
    city_id: number;
  };

  genres: number[];

  books: {
    read: number[];
    wantRead: number[];
  };
};
