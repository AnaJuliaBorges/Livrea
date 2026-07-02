export interface Book {
  google_id: string;
  info: {
    isbn?: string;
    title: string;
    subtitle: string;
    authors: string[];
    summary?: string;
    pageCount?: number;
  };
  genre: {
    main?: string;
    secondary?: string[];
  };
  publisher: {
    publisherDate: string;
    publisher: string;
  };
  image: {
    smallThumbnail?: string;
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
  averageRating?: number;
  ratingsCount?: number;
}

export interface BookTemp {
  id: string;
  isbn: string;

  title_original: string;
  title_pt: string | null;
  subtitle: string | null;

  authors: string[];

  synopsis: string | null;

  publisher: string | null;
  publisher_date: string | null;

  total_pages: number;

  image_thumbnail?: string;
  image_medium?: string;
  image_large?: string;

  primary_genre: {
    id: number;
    name: string;
  };

  secondary_genres: string[];

  global_average_rating?: number;
  global_count_rating?: number;

  local_average_rating?: number;
  local_count_rating?: number;
}
