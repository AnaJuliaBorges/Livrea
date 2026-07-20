import placeholder from "../../../assets/placeholder.png";
import { Tag } from "@/components/Tag";
import { LocalizationPin } from "@/components/LocalizationPin";
import { MeetingTypeTag } from "./MeetingTypeTag";
import type { ClubSummary } from "@/features/profile";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

interface ItemClubProps {
  // meetingType é opcional porque o ClubSummary do perfil (get_my_profile)
  // ainda não retorna o tipo de encontro — só a listagem retorna
  club: ClubSummary & { meetingType?: string; isPrivate?: boolean };
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
          <div className="flex items-center gap-2">
            <h2 className="font-medium">{club.name}</h2>
            {club.isPrivate && (
              <Lock
                className="size-3.5 text-gray-500"
                aria-label="Clube privado"
              />
            )}
          </div>
          {admin && <span className="text-xs text-primary">administrador</span>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {club.city && club.state && (
            <LocalizationPin city={club.city} state={club.state} />
          )}
          {club.meetingType && (
            <MeetingTypeTag type={club.meetingType} variant="soft" />
          )}
        </div>

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
