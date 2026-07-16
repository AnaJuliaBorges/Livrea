import { ContainerBorder } from "@/components/ContainerBorder";
import type { ClubInteractions } from "@/mocks/clubes";
import { ArrowLeft, Star, UserRound } from "lucide-react";

export function ReviewsSection({
  onBack,
  interactions,
}: {
  onBack: () => void;
  interactions: ClubInteractions;
}) {
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
      {interactions.reviews.map((review) => (
        <ContainerBorder>
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <UserRound size={20} />
              <p className="text-xs font-medium">{review.user.name}</p>
            </div>

            <p className="text-xs flex font-semibold gap-1">
              {review.rating} <Star size={16} />
            </p>
          </div>

          <p className="text-xs">{review.review}</p>
        </ContainerBorder>
      ))}
    </div>
  );
}
