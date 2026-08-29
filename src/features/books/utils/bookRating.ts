import type { BookTemp } from "../types/book";

export const formatRatingValue = (rating?: number | null) =>
  rating != null ? rating.toFixed(1) : "0.0";

export const getBookRatingDisplay = (book?: BookTemp) =>
  formatRatingValue(book?.local_average_rating ?? book?.global_average_rating);
