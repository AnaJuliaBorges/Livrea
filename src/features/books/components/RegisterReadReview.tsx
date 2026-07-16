import { ContainerBorder } from "@/components/ContainerBorder";
import { Button, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteReview, useSaveReview } from "../hooks/useReadingTracking";

interface Props {
  bookId: string;
  rating: number | null;
  review: string | null;
}

export default function RegisterReadReview({ bookId, rating, review }: Props) {
  const hasReview = rating !== null || !!review;

  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newRating, setNewRating] = useState(rating ?? 0);
  const [newReview, setNewReview] = useState(review ?? "");

  const { mutateAsync: saveReview, isPending } = useSaveReview(bookId);
  const deleteReview = useDeleteReview(bookId);

  const handleDelete = () => {
    deleteReview.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setNewRating(0);
        setNewReview("");
        toast.success("Avaliação excluída.");
      },
      onError: (error) => {
        console.error("Error deleting review:", error);
        toast.error("Não foi possível excluir a avaliação. Tente novamente.");
      },
    });
  };

  async function handleSave() {
    try {
      await saveReview({ rating: newRating, review: newReview.trim() });
      setEditing(false);
      toast.success("Avaliação salva!");
    } catch {
      toast.error("Não foi possível salvar a avaliação. Tente novamente.");
    }
  }

  if (editing || !hasReview) {
    return (
      <ContainerBorder className="mb-16">
        <p className="text-sm font-medium">
          {hasReview ? "Editar avaliação" : "Fazer avaliação"}
        </p>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setNewRating(value)}
              aria-label={`${value} estrelas`}
            >
              <Star
                size={28}
                className={cn(
                  "text-gray-300",
                  value <= newRating && "text-primary fill-primary",
                )}
              />
            </button>
          ))}
        </div>

        <Textarea
          placeholder="O que você achou do livro?"
          className="min-h-28"
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
        />

        <div className="flex gap-2">
          <Button
            variant="link"
            size="sm"
            disabled={newRating === 0 || isPending}
            onClick={handleSave}
          >
            {isPending ? "Salvando..." : "Salvar avaliação"}
          </Button>
          {hasReview && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          )}
        </div>
      </ContainerBorder>
    );
  }

  return (
    <ContainerBorder className="mb-7">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Sua avaliação</p>
        <p className="flex items-center gap-1">
          {rating?.toFixed(1) ?? "0.0"}
          <Star className="inline-block" size={21} />
        </p>
      </div>
      {review && <p className="text-sm">"{review}"</p>}
      <div className="mt-2 flex gap-4">
        <Button
          className="self-start pl-0 text-sm"
          size="sm"
          variant="link"
          onClick={() => {
            setNewRating(rating ?? 0);
            setNewReview(review ?? "");
            setEditing(true);
          }}
        >
          Editar avaliação
        </Button>
        <Button
          className="self-start pl-0 text-sm text-destructive"
          size="sm"
          variant="link"
          onClick={() => setShowDeleteModal(true)}
        >
          Excluir avaliação
        </Button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 flex flex-col gap-4">
            <h2 className="text-lg font-medium">Excluir avaliação</h2>

            <p className="text-sm text-muted-foreground">
              Sua nota e resenha deste livro serão apagadas. Essa ação não pode
              ser desfeita.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="link"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteReview.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteReview.isPending}
              >
                {deleteReview.isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ContainerBorder>
  );
}
