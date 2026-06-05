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
