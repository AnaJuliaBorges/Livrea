import { supabase } from "@/lib/supabase";

export type FeedActor = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type FeedBook = {
  id: string;
  title: string;
  image: string | null;
};

export type FeedClub = {
  id: string;
  name: string;
  coverUrl: string | null;
};

// União discriminada por `type` — cada evento carrega só o payload que usa.
export type FeedEvent =
  | { id: string; type: "started_book"; createdAt: string; actor: FeedActor; book: FeedBook }
  | { id: string; type: "finished_book"; createdAt: string; actor: FeedActor; book: FeedBook }
  | {
      id: string;
      type: "reviewed_book";
      createdAt: string;
      actor: FeedActor;
      book: FeedBook;
      rating: number | null;
      review: string | null;
    }
  | { id: string; type: "joined_club"; createdAt: string; actor: FeedActor; club: FeedClub };

export const FEED_PAGE_SIZE = 20;

type RawActor = { id: string; name: string; avatar_url: string | null };
type RawBook = { id: string; title: string; image: string | null };
type RawClub = { id: string; name: string; cover_url: string | null };

type RawFeedEvent = {
  id: string;
  type: FeedEvent["type"];
  created_at: string;
  actor: RawActor;
  book: RawBook | null;
  club: RawClub | null;
  rating: number | null;
  review: string | null;
};

function mapActor(actor: RawActor): FeedActor {
  return { id: actor.id, name: actor.name, avatarUrl: actor.avatar_url };
}

function mapBook(book: RawBook): FeedBook {
  return { id: book.id, title: book.title, image: book.image };
}

function mapClub(club: RawClub): FeedClub {
  return { id: club.id, name: club.name, coverUrl: club.cover_url };
}

function mapEvent(raw: RawFeedEvent): FeedEvent {
  const base = { id: raw.id, createdAt: raw.created_at, actor: mapActor(raw.actor) };

  switch (raw.type) {
    case "started_book":
      return { ...base, type: "started_book", book: mapBook(raw.book!) };
    case "finished_book":
      return { ...base, type: "finished_book", book: mapBook(raw.book!) };
    case "reviewed_book":
      return {
        ...base,
        type: "reviewed_book",
        book: mapBook(raw.book!),
        rating: raw.rating,
        review: raw.review,
      };
    case "joined_club":
      return { ...base, type: "joined_club", club: mapClub(raw.club!) };
  }
}

// Página do feed do usuário logado: atualizações de quem ele segue, ordenadas
// por tempo (a RPC get_feed aplica a regra de clube privado no servidor).
export async function getFeed(
  offset = 0,
  limit = FEED_PAGE_SIZE,
): Promise<FeedEvent[]> {
  const { data, error } = await supabase.rpc("get_feed", {
    p_limit: limit,
    p_offset: offset,
  });

  if (error) throw error;

  return ((data ?? []) as RawFeedEvent[]).map(mapEvent);
}
