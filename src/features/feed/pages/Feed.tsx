import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui";
import { useFeed } from "../hooks/useFeed";
import { FeedItem } from "../components/FeedItem";

export default function Feed() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed();

  const events = data?.pages.flat() ?? [];

  return (
    <div className="mb-16 flex flex-col gap-4 md:mx-auto md:w-full md:max-w-2xl">
      <h1 className="text-lg font-medium">Feed</h1>

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Carregando o feed...
        </p>
      ) : isError ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Não foi possível carregar o feed. Tente de novo mais tarde.
        </p>
      ) : events.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
          <Newspaper size={40} className="text-gray-300" />
          <p className="text-sm">Nada por aqui ainda.</p>
          <p className="max-w-xs text-center text-xs">
            Siga outras pessoas para acompanhar as leituras e os clubes delas
            aqui.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-1">
            <Link to="/clubes">Explorar clubes</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((event) => (
            <FeedItem key={event.id} event={event} />
          ))}

          {hasNextPage && (
            <Button
              variant="outline"
              className="mt-2 self-center"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
