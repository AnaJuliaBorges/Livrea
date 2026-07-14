import { supabase } from "@/lib/supabase";
import { requireUserId } from "./userBookStatus";

export type ReadingFeeling = "não curti" | "meh" | "ok" | "gostei" | "amei";

export type ReadingLogEntry = {
  id: string;
  pages_read: number;
  feeling: ReadingFeeling;
  created_at: string;
};

export type BookHighlightEntry = {
  id: string;
  page: number;
  quote: string;
};

export type ReadingTracking = {
  currentPage: number;
  rating: number | null;
  review: string | null;
  logs: ReadingLogEntry[];
  highlights: BookHighlightEntry[];
};

export async function getReadingTracking(
  bookId: string,
): Promise<ReadingTracking> {
  const userId = await requireUserId();

  const [libraryResult, logsResult, highlightsResult] = await Promise.all([
    supabase
      .from("user_library")
      .select("current_page, rating, review")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .maybeSingle(),
    supabase
      .from("reading_logs")
      .select("id, pages_read, feeling, created_at")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .order("created_at", { ascending: false }),
    supabase
      .from("book_highlights")
      .select("id, page, quote")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .order("page"),
  ]);

  if (libraryResult.error) throw libraryResult.error;
  if (logsResult.error) throw logsResult.error;
  if (highlightsResult.error) throw highlightsResult.error;

  return {
    currentPage: libraryResult.data?.current_page ?? 0,
    rating: libraryResult.data?.rating ?? null,
    review: libraryResult.data?.review ?? null,
    logs: (logsResult.data ?? []) as ReadingLogEntry[],
    highlights: (highlightsResult.data ?? []) as BookHighlightEntry[],
  };
}

// logs e destaques têm FK para a user_library — garante a linha sem
// mexer num status já escolhido pelo usuário
async function ensureLibraryRow(userId: string, bookId: string) {
  const { error } = await supabase.from("user_library").upsert(
    { user_id: userId, book_id: bookId, status: "reading" },
    { onConflict: "user_id,book_id", ignoreDuplicates: true },
  );

  if (error) throw error;
}

export async function saveReadingProgress(
  bookId: string,
  currentPage: number,
  feeling: ReadingFeeling,
) {
  const userId = await requireUserId();
  await ensureLibraryRow(userId, bookId);

  const { error: progressError } = await supabase
    .from("user_library")
    .update({ current_page: currentPage })
    .eq("user_id", userId)
    .eq("book_id", bookId);

  if (progressError) throw progressError;

  const { error } = await supabase.from("reading_logs").insert({
    user_id: userId,
    book_id: bookId,
    pages_read: currentPage,
    feeling,
  });

  if (error) throw error;
}

export async function saveHighlight(bookId: string, page: number, quote: string) {
  const userId = await requireUserId();
  await ensureLibraryRow(userId, bookId);

  const { error } = await supabase.from("book_highlights").insert({
    user_id: userId,
    book_id: bookId,
    page,
    quote,
  });

  if (error) throw error;
}

export async function updateHighlight(
  highlightId: string,
  page: number,
  quote: string,
) {
  const userId = await requireUserId();

  const { error } = await supabase
    .from("book_highlights")
    .update({ page, quote })
    .eq("id", highlightId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function saveReview(
  bookId: string,
  rating: number,
  review: string,
) {
  const userId = await requireUserId();

  const { error } = await supabase
    .from("user_library")
    .update({ rating, review })
    .eq("user_id", userId)
    .eq("book_id", bookId);

  if (error) throw error;
}
