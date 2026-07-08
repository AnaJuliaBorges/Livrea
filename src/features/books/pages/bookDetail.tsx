import { useNavigate, useParams } from "react-router-dom";
import { mockBooks, mockReadingInteraction } from "@/mocks/books";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ClipboardList,
  MessageCircleMore,
  PencilLine,
  Star,
} from "lucide-react";
import { BookImage } from "../components/BookImage";
import { Tag } from "@/components/tag";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ReviewCard } from "../components/ReviewCard";
import { ProgressRead } from "@/components/ProgressRead";
import { TrackRead } from "../components/TrackRead";
import { formatDate, formatDateString } from "../utils/formatDate";
import { ContainerBorder } from "@/components/ContainerBorder";

export function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("");

  const book = mockBooks.find((book) => book.id === id);

  if (!book) {
    return <p>Livro não encontrado.</p>;
  }

  return (
    <>
      <div className="relative left-1/2 -mt-6 h-40 w-screen -translate-x-1/2 bg-gradient-to-br from-violet-800 via-purple-900 to-slate-950">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 z-10 rounded-full text-accent-foreground hover:bg-white/20 hover:text-white"
        >
          <ArrowLeft className="size-6" />
        </Button>

        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 rounded-lg shadow-xl">
          <BookImage book={book} height="h-52" />
        </div>
      </div>
      <div className="flex flex-col gap-6 mt-28">
        <div className="flex justify-between">
          <div className="flex flex-col gap-1 max-w-2/3">
            <h1 className="text-lg font-medium">{book.title_pt}</h1>
            <p className="text-sm">{book.authors}</p>
          </div>
          <p className="flex items-center gap-1">
            {book.global_average_rating ?? "0.0"}
            <Star className="inline-block" size={21} />
          </p>
        </div>

        <Select value={status} onValueChange={setStatus}>
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
              <SelectItem value="">Adicionar livro</SelectItem>
              <SelectItem value="read">Lido</SelectItem>
              <SelectItem value="reading">Lendo</SelectItem>
              <SelectItem value="want_to_read">Quero ler</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {status === "reading" && (
          <ContainerBorder>
            <p className="text-xs font-semibold">Sua leitura</p>
            <ProgressRead value={60} />
            <TrackRead bookId={book.id} />
          </ContainerBorder>
        )}

        {status === "read" && (
          <ContainerBorder>
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold">Sua leitura</p>
              <p className="flex gap-1">
                {mockReadingInteraction.review?.rating ?? "0.0"}
                <Star className="inline-block" size={21} />
              </p>
            </div>
            <TrackRead bookId={book.id} />
            <p className="text-sm">
              Lido de{" "}
              {formatDateString(
                mockReadingInteraction.reading_logs[0].created_at,
              )}{" "}
              a{" "}
              {formatDateString(
                mockReadingInteraction.reading_logs[
                  mockReadingInteraction.reading_logs.length - 1
                ].created_at,
              )}
            </p>
          </ContainerBorder>
        )}
      </div>

      <div className="flex flex-col gap-2 border p-4 rounded-xl mt-7">
        <p className="text-xs font-medium">Sinopse</p>
        <p className="text-xs">{book.synopsis}</p>
        <div className="flex flex-wrap gap-2 ">
          <Tag className="text-xs">{book.publisher}</Tag>
          <Tag className="text-xs">{book.publisher_date}</Tag>
          <Tag className="text-xs">{book.total_pages} páginas</Tag>
          <Tag className="text-xs">{book.primary_genre.name}</Tag>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-10 mt-7">
        <p className="text-xs font-medium">Avaliações</p>

        {book.reviews?.length ? (
          <>
            {book.reviews.map((review) => (
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
