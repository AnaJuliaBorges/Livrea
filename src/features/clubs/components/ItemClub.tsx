import placeholder from "../../../assets/placeholder.png";
import { Tag } from "@/components/Tag";
import { LocalizationPin } from "@/components/LocalizationPin";
import type { ClubSummary } from "@/features/profile/dtos";
import { useNavigate } from "react-router-dom";

interface ItemClubProps {
  club: ClubSummary;
  admin?: boolean;
}

export default function ItemClub({ club, admin }: ItemClubProps) {
  const navigate = useNavigate();

  return (
    <div
      key={club.id}
      className="flex gap-4"
      onClick={() => navigate(`/clubes/${club.id}`)}
    >
      <img
        src={club.coverUrl ?? placeholder}
        alt={club.name}
        className="w-24 h-24 rounded-md border-2 border-gray-300 object-cover"
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <h2 className="font-medium">{club.name}</h2>
          {admin && <span className="text-xs text-primary">administrador</span>}
        </div>

        {club.city && club.state && (
          <LocalizationPin city={club.city} state={club.state} />
        )}

        {club.genres && club.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {club.genres.map((genre, index) => (
              <Tag key={index}>{genre}</Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
