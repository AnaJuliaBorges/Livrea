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
