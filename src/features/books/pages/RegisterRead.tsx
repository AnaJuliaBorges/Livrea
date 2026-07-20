import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookImage } from "../components/BookImage";
import RegisterReadHistory from "../components/RegisterReadHistory";
import RegisterReadHighlights from "../components/RegisterReadHighlights";
import RegisterReadReview from "../components/RegisterReadReview";
import { useBook } from "../hooks/useBook";
import { useReadingTracking } from "../hooks/useReadingTracking";
import { useUserBookStatus } from "../hooks/useUserBookStatus";

export default function RegisterRead() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: book, isLoading: isLoadingBook } = useBook(id);
  const { data: tracking, isLoading: isLoadingTracking } =
    useReadingTracking(id);
  // o status precisa estar resolvido antes do primeiro render das Tabs:
  // defaultValue não é controlado e não muda depois
  const { data: userStatus, isLoading: isLoadingStatus } =
    useUserBookStatus(id);

  if (isLoadingBook || isLoadingTracking || isLoadingStatus) {
    return (
      <p className="mt-20 text-center text-muted-foreground">
        Carregando registro...
      </p>
    );
  }

  if (!book || !tracking) {
    return (
      <p className="mt-20 text-center text-muted-foreground">
        Livro não encontrado.
      </p>
    );
  }

  // marcado como "Lido" libera a resenha mesmo sem o contador de páginas
  // ter chegado ao fim
  const finished =
    userStatus === "read" ||
    (book.total_pages > 0 && tracking.currentPage >= book.total_pages);

  return (
    <div className="md:mx-auto md:w-full md:max-w-3xl">
      <div
        className="py-5 flex gap-4 border-b mb-5"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="md:hidden" />
        <h2>Registro de leitura</h2>
      </div>
      <div className="flex gap-4 items-center mb-8">
        <BookImage book={book} height="h-40" className="shrink-0" />
        <div className="min-w-0">
          <p className="text-lg font-medium line-clamp-2">
            {book.title_pt ?? book.title_original}
          </p>
          <p className="text-sm truncate">{book.authors.join(", ")}</p>
        </div>
      </div>

      <Tabs
        defaultValue={userStatus === "read" ? "review" : "history"}
        className="w-full"
      >
        <TabsList className="w-full mb-4">
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="highlights">Destaques</TabsTrigger>
          <TabsTrigger value="review" disabled={!finished}>
            Resenha
          </TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <RegisterReadHistory
            bookId={book.id}
            totalPages={book.total_pages}
            lastProgress={tracking.currentPage}
            logs={tracking.logs}
          />
        </TabsContent>
        <TabsContent value="highlights">
          <RegisterReadHighlights
            bookId={book.id}
            highlights={tracking.highlights}
          />
        </TabsContent>
        <TabsContent value="review">
          <RegisterReadReview
            bookId={book.id}
            rating={tracking.rating}
            review={tracking.review}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
