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
}

export interface IsbndbResponse {
  books: IsbndbBook[];
  total: number;
}
