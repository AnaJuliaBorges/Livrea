import { Link } from "react-router-dom";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { formatRelativeTime } from "@/lib/dates";
import type { FeedBook, FeedEvent } from "../services/getFeed";

function BookLink({ book }: { book: FeedBook }) {
  return (
    <Link to={`/livros/${book.id}`} className="font-medium text-primary">
      {book.title}
    </Link>
  );
}

// Frase da ação por tipo de evento (o nome do actor vem antes, no card).
function EventAction({ event }: { event: FeedEvent }) {
  switch (event.type) {
    case "started_book":
      return (
        <>
          Começou a ler <BookLink book={event.book} />
        </>
      );
    case "finished_book":
      return (
        <>
          Terminou de ler <BookLink book={event.book} />
        </>
      );
    case "reviewed_book":
      return (
        <>
          Avaliou <BookLink book={event.book} />
          {typeof event.rating === "number" && ` — nota ${event.rating}`}
        </>
      );
    case "joined_club":
      return (
        <>
          Entrou no clube{" "}
          <Link
            to={`/clubes/${event.club.id}`}
            className="font-medium text-primary"
          >
            {event.club.name}
          </Link>
        </>
      );
  }
}

// Miniatura à direita: capa do livro ou do clube, quando houver.
function eventThumb(event: FeedEvent): { src: string; to: string } | null {
  if (event.type === "joined_club") {
    return event.club.coverUrl
      ? { src: event.club.coverUrl, to: `/clubes/${event.club.id}` }
      : null;
  }
  return event.book.image
    ? { src: event.book.image, to: `/livros/${event.book.id}` }
    : null;
}

export function FeedItem({ event }: { event: FeedEvent }) {
  const { actor } = event;
  const thumb = eventThumb(event);

  return (
    <article className="flex gap-3 rounded-lg border border-border p-3">
      <Link to={`/perfil/${actor.id}`} className="shrink-0">
        <UserAvatar
          name={actor.name}
          src={actor.avatarUrl}
          className="size-10"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col">
          <p className="text-sm">
            <Link to={`/perfil/${actor.id}`} className="font-medium">
              {actor.name}
            </Link>{" "}
          </p>
          <time className="shrink-0 text-[10px] text-gray-500">
            {formatRelativeTime(event.createdAt)}
          </time>
        </div>

        <p className="text-sm">
          <EventAction event={event} />
        </p>

        {event.type === "reviewed_book" && event.review && (
          <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
            "{event.review}"
          </p>
        )}
      </div>

      {thumb && (
        <Link to={thumb.to} className="shrink-0">
          <img
            src={thumb.src}
            alt=""
            className="h-14 w-10 rounded object-cover"
          />
        </Link>
      )}
    </article>
  );
}
