export interface FriendProfile {
  id: string;
  nome: string;
  username: string;
  foto: string;
}

export interface ClubSummary {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  generos: string[];
  administrador: boolean;
  participantes: number;
  limite_participantes: number | null;
}

export interface UserBook {
  id: string;
  titulo: string;
  avaliacao_geral: number;
  image: {
    smallThumbnail?: string;
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
}

export interface UserProfile {
  id: string;
  nome: string;
  username: string;
  foto: string;
  cidade: string;
  estado: string;
  bio: string;

  amigos: FriendProfile[];

  clubes: ClubSummary[];

  biblioteca: {
    lidos: UserBook[];
    lendo: UserBook[];
    quero_ler: UserBook[];
  };
}

export type ReadingFeeling = "não curti" | "meh" | "okay" | "gostei" | "amei";

export interface ReadingLog {
  pages_read: number;
  feeling: ReadingFeeling;
  created_at: string;
}

export interface BookHighlight {
  page: number;
  percentage: number;
  quote: string;
}

export interface Review {
  rating: number;
  review: string;
}

export interface ReadingInteraction {
  user_id: string;
  book_id: string;
  total_pages: number;
  last_progress: number;

  reading_logs: ReadingLog[];
  highlights: BookHighlight[];
  review: Review | null;
}
