export interface FriendProfile {
  id: string;
  name: string;
  username: string;
  photo: string;
}

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
  overallRating: number;
  image: {
    smallThumbnail?: string;
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  photo: string;
  city: string;
  state: string;
  bio: string;

  friends: FriendProfile[];

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
