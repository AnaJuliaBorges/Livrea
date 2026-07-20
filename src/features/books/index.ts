// API pública da feature books — o que as outras features podem importar.
// Import cross-feature só passa por aqui (regra em eslint.config.js);
// páginas ficam de fora de propósito (o router as importa direto pro
// code splitting por rota).
export { BookImage } from "./components/BookImage";
export { BookListCard } from "./components/BookListCard";
export { BookResults } from "./components/BookResults";
export { useBook } from "./hooks/useBook";
export { useDebounce } from "./hooks/useDebounce";
export { useGenres } from "./hooks/useGenres";
export { useSearchBooks } from "./hooks/useSearchBooks";
export { useSaveUserBooks } from "./hooks/useSaveUserBooks";
export { searchGoogleBooks } from "./api/googleBooks";
export { searchIsbndbByQuery } from "./api/isbndb";
export { mapGoogleBook } from "./services/mapGoogleBook";
export { mapIsbndb } from "./services/mapIsbndb";
export { upsertBook } from "./services/upsertBook";
export { getSelectedGenreNames } from "./utils/genreUtils";
export { formatRatingValue, getBookRatingDisplay } from "./utils/bookRating";
export type { Book, BookTemp, BookReview } from "./types/book";
