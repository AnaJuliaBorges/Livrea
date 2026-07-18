import { supabase } from "@/lib/supabase";
import { requireUserId } from "./userBookStatus";

export type ReadingFeeling = "não curti" | "meh" | "ok" | "gostei" | "amei";

export type ReadingLogEntry = {
  id: string;
  pages_read: number;
  feeling: ReadingFeeling;
  note: string | null;
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
      .select("id, pages_read, feeling, note, created_at")
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
  note?: string,
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
    note: note?.trim() || null,
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

// Apaga um registro do histórico e recua a página atual pro maior progresso
// restante (senão a barra de progresso ficaria mentindo pra sempre).
export async function deleteReadingLog(bookId: string, logId: string) {
  const userId = await requireUserId();

  const { error } = await supabase
    .from("reading_logs")
    .delete()
    .eq("id", logId)
    .eq("user_id", userId);

  if (error) throw error;

  const { data: remaining, error: remainingError } = await supabase
    .from("reading_logs")
    .select("pages_read")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .order("pages_read", { ascending: false })
    .limit(1);

  if (remainingError) throw remainingError;

  const { error: updateError } = await supabase
    .from("user_library")
    .update({ current_page: remaining?.[0]?.pages_read ?? 0 })
    .eq("user_id", userId)
    .eq("book_id", bookId);

  if (updateError) throw updateError;
}

export async function deleteHighlight(highlightId: string) {
  const userId = await requireUserId();

  const { error } = await supabase
    .from("book_highlights")
    .delete()
    .eq("id", highlightId)
    .eq("user_id", userId);

  if (error) throw error;
}

// A avaliação mora na user_library — excluir é zerar nota e texto
// (a linha fica, preservando status/progresso da leitura)
export async function deleteReview(bookId: string) {
  const userId = await requireUserId();

  const { error } = await supabase
    .from("user_library")
    .update({ rating: null, review: null })
    .eq("user_id", userId)
    .eq("book_id", bookId);

  if (error) throw error;
}
