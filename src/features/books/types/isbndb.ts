export interface IsbndbBook {
  isbn: string;
  isbn13: string;
  title: string;
  author?: string;
  authors?: string[];
  publisher?: string;
  image?: string;
  pages?: number;
  language?: string;
  date_published?: string;
  edition?: string;
  binding?: string;
  synopsis?: string;
  subjects?: string[];
}

export interface IsbndbResponse {
  books: IsbndbBook[];
  total: number;
}

export interface IsbndbBookResponse {
  book?: IsbndbBook;
}
