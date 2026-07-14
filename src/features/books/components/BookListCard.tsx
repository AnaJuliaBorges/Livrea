import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import placeholderBook from "@/assets/book-placeholder.png";

export function BookListCard({
  title,
  image,
  to,
  onClick,
  rating,
}: {
  title: string;
  image?: string;
  to?: string;
  onClick?: () => void;
  rating?: number | null;
}) {
  const showRating = rating !== undefined;

  const content = (
    <>
      <img
        src={image || placeholderBook}
        alt={title}
        className="w-full aspect-2/3 object-cover rounded-lg"
        onError={(e) => {
          e.currentTarget.src = placeholderBook;
        }}
      />
      <p className="font-medium line-clamp-2">{title}</p>
      {showRating && (
        <p className="flex items-center gap-1">
          {rating?.toFixed(1) ?? "0.0"}
          <Star className="inline-block" size={16} />
        </p>
      )}
    </>
  );

  const cardClass = `flex flex-col gap-2 border rounded-xl p-2${
    showRating ? " justify-between" : ""
  }`;

  if (to) {
    return (
      <Link to={to} className={cardClass}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div
        className={`${cardClass} cursor-pointer`}
        onClick={onClick}
        role="button"
      >
        {content}
      </div>
    );
  }

  return <div className={cardClass}>{content}</div>;
}
