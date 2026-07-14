import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BookReview } from "../types/book";
import { formatDate } from "../utils/formatDate";

export function ReviewCard({ review }: { review: BookReview }) {
  const initials = review.user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex flex-col gap-2 border p-4 rounded-xl">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage
              src={review.user.photo || undefined}
              alt={review.user.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-gray-300 text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

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
