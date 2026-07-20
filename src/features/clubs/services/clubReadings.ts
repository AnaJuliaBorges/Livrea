// Leituras do clube: definir/finalizar/remover a leitura atual, nota do
// admin e os dados da aba Leitura (leitores, nota média, resenhas e
// destaques dos membros). Antes um arquivo por RPC; agrupado por agregado.
import { supabase } from "@/lib/supabase";

// ------------------------------------------------------------ setClubReading

export async function setClubReading(
  clubId: string,
  bookId: string,
): Promise<void> {
  const { error } = await supabase.rpc("set_club_reading", {
    p_club_id: clubId,
    p_book_id: bookId,
  });

  if (error) throw error;
}

// ------------------------------------------------------- completeClubReading

// Fecha a leitura atual (status -> finished) e o encontro agendado pra ela
// (se houver), sem exigir que um próximo livro já esteja escolhido. `note` é a
// impressão geral do admin sobre a leitura, gravada na mesma linha e exibida na
// "Nota do clube" do histórico; vazio/ausente não grava nota.
export async function completeClubReading(
  clubId: string,
  note?: string,
): Promise<void> {
  const { error } = await supabase.rpc("complete_club_reading", {
    p_club_id: clubId,
    p_note: note?.trim() || null,
  });

  if (error) throw error;
}

// --------------------------------------------------------- deleteClubReading

// Remove a leitura atual sem arquivá-la no histórico (diferente de
// completeClubReading, que finaliza e manda pro histórico).
export async function deleteClubReading(clubId: string): Promise<void> {
  const { error } = await supabase.rpc("delete_club_reading", {
    p_club_id: clubId,
  });

  if (error) throw error;
}

// -------------------------------------------------------- setClubReadingNote

// Admin-only (a RPC valida). String vazia limpa a nota.
export async function setClubReadingNote(
  readingId: string,
  note: string,
): Promise<void> {
  const { error } = await supabase.rpc("set_club_reading_note", {
    p_reading_id: readingId,
    p_note: note,
  });

  if (error) throw error;
}

// ----------------------------------------------------- getClubReadingReaders

export interface ClubReadingReader {
  userId: string;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  // % lida da edição que o próprio membro está lendo (o de-para de edições
  // equivalentes é feito na RPC por título+autores, não só por ISBN)
  progress: number;
  // false = ainda não começou (sem registro ou só na lista de desejos)
  started: boolean;
  rating: number | null;
}

type RawClubReadingReader = {
  user_id: string;
  name: string;
  avatar_url: string | null;
  is_admin: boolean;
  progress: number;
  started: boolean;
  rating: number | null;
};

export async function getClubReadingReaders(
  clubId: string,
  bookId: string,
): Promise<ClubReadingReader[]> {
  const { data, error } = await supabase.rpc("get_club_reading_readers", {
    p_club_id: clubId,
    p_book_id: bookId,
  });

  if (error) throw error;

  return ((data ?? []) as RawClubReadingReader[]).map((reader) => ({
    userId: reader.user_id,
    name: reader.name,
    avatarUrl: reader.avatar_url,
    isAdmin: reader.is_admin,
    progress: reader.progress,
    started: reader.started,
    rating: reader.rating,
  }));
}

// -------------------------------------------------------- getClubBookRating

export interface ClubBookRating {
  // média das notas dos membros do clube pro livro (null = ninguém avaliou)
  clubAverage: number | null;
  clubCount: number;
  // nota do próprio usuário pro livro (null = ainda não avaliou)
  myRating: number | null;
}

type RawClubBookRating = {
  club_average: number | null;
  club_count: number;
  my_rating: number | null;
};

export async function getClubBookRating(
  clubId: string,
  bookId: string,
): Promise<ClubBookRating> {
  const { data, error } = await supabase.rpc("get_club_book_rating", {
    p_club_id: clubId,
    p_book_id: bookId,
  });

  if (error) throw error;

  const raw = (data ?? {}) as RawClubBookRating;

  return {
    clubAverage: raw.club_average,
    clubCount: raw.club_count ?? 0,
    myRating: raw.my_rating,
  };
}

// ------------------------------------------------------- getClubBookReviews

export interface ClubBookReview {
  userId: string;
  name: string;
  avatarUrl: string | null;
  rating: number | null;
  review: string;
}

type RawClubBookReview = {
  user_id: string;
  name: string;
  avatar_url: string | null;
  rating: number | null;
  review: string;
};

// Resenhas dos membros do clube pro livro — considera edições equivalentes
// (de-para por título+autores feito na RPC via get_equivalent_editions)
export async function getClubBookReviews(
  clubId: string,
  bookId: string,
): Promise<ClubBookReview[]> {
  const { data, error } = await supabase.rpc("get_club_book_reviews", {
    p_club_id: clubId,
    p_book_id: bookId,
  });

  if (error) throw error;

  return ((data ?? []) as RawClubBookReview[]).map((review) => ({
    userId: review.user_id,
    name: review.name,
    avatarUrl: review.avatar_url,
    rating: review.rating,
    review: review.review,
  }));
}

// ----------------------------------------------------- getClubBookHighlights

export interface ClubBookHighlight {
  userId: string;
  name: string;
  avatarUrl: string | null;
  // página da edição que o próprio membro está lendo — varia entre edições,
  // por isso o agrupamento de citações é por texto (groupHighlights), não
  // por página
  page: number;
  quote: string;
}

type RawClubBookHighlight = {
  user_id: string;
  name: string;
  avatar_url: string | null;
  page: number;
  quote: string;
};

export async function getClubBookHighlights(
  clubId: string,
  bookId: string,
): Promise<ClubBookHighlight[]> {
  const { data, error } = await supabase.rpc("get_club_book_highlights", {
    p_club_id: clubId,
    p_book_id: bookId,
  });

  if (error) throw error;

  return ((data ?? []) as RawClubBookHighlight[]).map((highlight) => ({
    userId: highlight.user_id,
    name: highlight.name,
    avatarUrl: highlight.avatar_url,
    page: highlight.page,
    quote: highlight.quote,
  }));
}
