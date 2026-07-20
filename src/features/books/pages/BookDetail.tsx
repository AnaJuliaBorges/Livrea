import { useParams } from "react-router-dom";
import { MessageCircleMore, Star } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { BookImage } from "../components/BookImage";
import { Tag } from "@/components/Tag";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { headerGradient } from "@/lib/headerColors";
import { toast } from "sonner";
import { ReviewCard } from "../components/ReviewCard";
import { ProgressRead } from "@/components/ProgressRead";
import { TrackRead } from "../components/TrackRead";
import { extractYear, formatDateString } from "@/lib/dates";
import { getBookRatingDisplay } from "../utils/bookRating";
import { ContainerBorder } from "@/components/ContainerBorder";
import { SafeHtml } from "@/components/SafeHtml";
import { useBook } from "../hooks/useBook";
import {
  useSetUserBookStatus,
  useUserBookStatus,
} from "../hooks/useUserBookStatus";
import { useReadingTracking } from "../hooks/useReadingTracking";
import { useBookReviews } from "../hooks/useBookReviews";
import type { UserBookStatus } from "../services/userBookStatus";

export function BookDetail() {
  const { id } = useParams();

  const { data: userStatus } = useUserBookStatus(id);
  const { mutate: saveStatus } = useSetUserBookStatus(id);
  const { data: tracking } = useReadingTracking(id);
  const { data: reviews } = useBookReviews(id);
  const status = userStatus ?? "";

  // logs vêm do mais recente para o mais antigo
  const lastLog = tracking?.logs[0];
  const firstLog = tracking?.logs[tracking.logs.length - 1];

  function handleStatusChange(value: string) {
    saveStatus(value === "remove" ? null : (value as UserBookStatus), {
      onError: () =>
        toast.error("Não foi possível salvar o status. Tente novamente."),
    });
  }

  const { data: book, isLoading, isError } = useBook(id);

  if (isLoading) {
    return (
      <p className="mt-20 text-center text-muted-foreground">
        Carregando livro...
      </p>
    );
  }

  if (isError || !book) {
    return (
      <p className="mt-20 text-center text-muted-foreground">
        Livro não encontrado.
      </p>
    );
  }

  return (
    <>
      <div
        className={`relative left-1/2 -mt-6 h-40 w-screen -translate-x-1/2 md:bg-none ${headerGradient()}`}
      >
        <BackButton className="absolute left-4 top-4 z-10 text-gray-300 hover:bg-white/20 md:hidden" />

        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 rounded-lg shadow-xl">
          <BookImage book={book} height="h-52" />
        </div>
      </div>
      <div className="flex flex-col gap-6 mt-28 md:mx-auto md:w-full md:max-w-3xl">
        <div className="flex justify-between">
          <div className="flex flex-col gap-1 max-w-2/3">
            <h1 className="text-lg font-medium">
              {book.title_pt ?? book.title_original}
            </h1>
            <p className="text-sm">{book.authors.join(", ")}</p>
          </div>
          <p className="flex items-center gap-1">
            {getBookRatingDisplay(book)}
            <Star className="inline-block" size={21} />
          </p>
        </div>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger
            className={cn(
              "w-full rounded-4xl transition-colors border-none",
              status && " text-gray-950 font-semibold",
              status === "read" && "bg-success-light ",
              status === "reading" && "bg-warning-light ",
              status === "want_to_read" && "bg-info-light ",
              !status && "bg-primary text-accent",
            )}
          >
            <SelectValue placeholder="Adicionar livro" />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-accent text-gray-500">
            <SelectGroup>
              {status && (
                <SelectItem value="remove">Remover da biblioteca</SelectItem>
              )}
              <SelectItem value="read">Lido</SelectItem>
              <SelectItem value="reading">Lendo</SelectItem>
              <SelectItem value="want_to_read">Quero ler</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {status === "reading" && (
          <ContainerBorder>
            <p className="text-xs font-semibold">Sua leitura</p>
            <ProgressRead
              value={
                book.total_pages > 0
                  ? Math.round(
                      ((tracking?.currentPage ?? 0) / book.total_pages) * 100,
                    )
                  : 0
              }
            />
            <TrackRead bookId={book.id} />
          </ContainerBorder>
        )}

        {status === "read" && (
          <ContainerBorder>
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold">Sua leitura</p>
              <p className="flex gap-1">
                {tracking?.rating?.toFixed(1) ?? "0.0"}
                <Star className="inline-block" size={21} />
              </p>
            </div>
            <TrackRead bookId={book.id} />
            {firstLog && lastLog && (
              <p className="text-sm">
                Lido de {formatDateString(firstLog.created_at)} a{" "}
                {formatDateString(lastLog.created_at)}
              </p>
            )}
          </ContainerBorder>
        )}
      </div>

      <div className="flex flex-col gap-2 border p-4 rounded-xl mt-7 md:mx-auto md:w-full md:max-w-3xl">
        <p className="text-xs font-medium">Sinopse</p>
        {book.synopsis && (
          <SafeHtml
            html={book.synopsis}
            className="text-xs [&_p]:mb-2 [&_p:last-child]:mb-0"
          />
        )}
        <div className="flex flex-wrap gap-2 ">
          {book.publisher && <Tag className="text-xs">{book.publisher}</Tag>}
          {book.publisher_date && (
            <Tag className="text-xs">{extractYear(book.publisher_date)}</Tag>
          )}
          {book.total_pages > 0 && (
            <Tag className="text-xs">{book.total_pages} páginas</Tag>
          )}
          {book.primary_genre && (
            <Tag className="text-xs">{book.primary_genre.name}</Tag>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-16 mt-7 md:mx-auto md:w-full md:max-w-3xl">
        <p className="text-xs font-medium">Avaliações</p>

        {reviews?.length ? (
          <>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </>
        ) : (
          <div className="flex flex-col gap-2 border p-4 rounded-xl items-center">
            <MessageCircleMore className="size-8 text-gray-300" />
            <p className="text-xs">Nenhuma avaliação ainda</p>
          </div>
        )}
      </div>
    </>
  );
}
