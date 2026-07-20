import { Star } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import type { BookReview } from "../types/book";
import { formatDate } from "@/lib/dates";

export function ReviewCard({ review }: { review: BookReview }) {
  return (
    <div className="flex flex-col gap-2 border p-4 rounded-xl">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <UserAvatar
            name={review.user.name}
            src={review.user.photo}
            className="size-8"
            fallbackClassName="bg-gray-300 text-xs"
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
