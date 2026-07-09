import { Heart, Star } from "lucide-react";
import type { BookReview } from "../types/book";
import { formatDate } from "../utils/formatDate";

export function ReviewCard({ review }: { review: BookReview }) {
  return (
    <div className="flex flex-col gap-2 border p-4 rounded-xl">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <img
            src={review.user.photo}
            alt={review.user.name}
            className="size-8 rounded-full"
          />

          <div>
            <p className="text-xs font-medium">{review.user.name}</p>
            <p className="text-xs">{formatDate(new Date(review.created_at))}</p>
          </div>
        </div>

        <p className="flex items-center gap-1 text-sm">
          {review.rating ?? "0.0"}
          <Star className="inline-block" size={16} />
        </p>
      </div>

      <p className="text-xs">{review.comment}</p>
    </div>
  );
}
