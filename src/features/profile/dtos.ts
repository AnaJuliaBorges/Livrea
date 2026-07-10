export interface ClubSummary {
  id: string;
  name: string;
  city: string;
  state: string;
  genres: string[];
  isAdmin: boolean;
  participants: number;
  participantLimit: number | null;
}

export interface UserBook {
  id: string;
  title: string;
  rating: number | null;
  imageThumbnail: string | null;
  imageMedium: string | null;
  imageLarge: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  city: string | null;
  state: string | null;
  stateId: number | null;
  cityId: number | null;

  clubs: ClubSummary[];

  library: {
    read: UserBook[];
    reading: UserBook[];
    wantToRead: UserBook[];
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
