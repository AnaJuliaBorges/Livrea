import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import placeholder from "../../../assets/placeholder.png";
import { MeetingTypeTag } from "./MeetingTypeTag";
import type { ClubListItem } from "../dtos";

const MAX_GENRE_TAGS = 3;

export function RecommendedClubCard({ club }: { club: ClubListItem }) {
  return (
    <Link
      to={`/clubes/${club.id}`}
      className="rounded-xl border flex flex-col p-2 gap-2"
    >
      <img
        src={club.coverUrl ?? placeholder}
        alt={club.name}
        className="h-40 w-60 border-2 rounded-md object-cover"
      />

      <p className="text-sm font-medium">{club.name}</p>
      <div className="flex flex-wrap items-center gap-3">
        {club.city && club.state && (
          <p className="flex text-sm items-center">
            <MapPin className="inline-block mr-1 text-gray-500" size={16} />
            {club.city}, {club.state}
          </p>
        )}
        <MeetingTypeTag type={club.meetingType} variant="soft" />
      </div>

      <div className="flex flex-wrap gap-2">
        {club.genres.slice(0, MAX_GENRE_TAGS).map((genre) => (
          <span key={genre} className="px-3 py-1 bg-[#f1f1f1] rounded-sm text-sm">
            {genre}
          </span>
        ))}
        {club.genres.length > MAX_GENRE_TAGS && (
          <span
            className="px-3 py-1 bg-[#f1f1f1] rounded-sm text-sm text-muted-foreground"
            title={club.genres.slice(MAX_GENRE_TAGS).join(", ")}
          >
            +{club.genres.length - MAX_GENRE_TAGS}
          </span>
        )}
      </div>
    </Link>
  );
}
