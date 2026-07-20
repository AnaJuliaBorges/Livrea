import { ContainerBorder } from "@/components/ContainerBorder";
import { UserAvatar } from "@/components/UserAvatar";
import { ArrowLeft, Star } from "lucide-react";
import { useClubBookReviews } from "../../hooks/useClubBookReviews";

export function ReviewsSection({
  clubId,
  bookId,
  onBack,
}: {
  clubId: string;
  bookId: string;
  onBack: () => void;
}) {
  const { data: reviews, isLoading } = useClubBookReviews(clubId, bookId);

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex gap-3 items-center p-2 hover:bg-gray-200 rounded-full transition"
        >
          <ArrowLeft size={20} />
          <h3 className="text-xs font-medium">Resenhas</h3>
        </button>
      </div>

      {isLoading ? (
        <ContainerBorder className="items-center text-xs text-muted-foreground">
          Carregando resenhas...
        </ContainerBorder>
      ) : (reviews ?? []).length === 0 ? (
        <ContainerBorder className="items-center text-xs text-muted-foreground">
          Nenhum participante resenhou este livro ainda.
        </ContainerBorder>
      ) : (
        (reviews ?? []).map((review) => (
          <ContainerBorder key={review.userId}>
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <UserAvatar
                  name={review.name}
                  src={review.avatarUrl}
                  className="h-8 w-8"
                  fallbackClassName="text-xs"
                />
                <p className="text-xs font-medium">{review.name}</p>
              </div>

              {review.rating !== null && (
                <p className="text-xs flex font-semibold gap-1">
                  {review.rating} <Star size={16} />
                </p>
              )}
            </div>

            <p className="text-xs">{review.review}</p>
          </ContainerBorder>
        ))
      )}
    </div>
  );
}
