import type { BookTemp } from "../types/book";

// Formata uma nota (0-5) com uma casa decimal; ausência de nota vira "0.0".
export const formatRatingValue = (rating?: number | null) =>
  rating != null ? rating.toFixed(1) : "0.0";

// Prioriza a média local (calculada a partir das avaliações no banco, via
// trigger em user_library) sobre a global (Google Books) — reflete os
// leitores da própria base antes de cair pro dado externo.
export const getBookRatingDisplay = (book?: BookTemp) =>
  formatRatingValue(book?.local_average_rating ?? book?.global_average_rating);
