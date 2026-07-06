import placeholder from "../../../assets/placeholder.png";
import { Tag } from "@/components/tag";
import { LocalizationPin } from "@/components/localizationPin";
import type { ClubSummary } from "@/features/profile/dtos";

interface itemClubProps {
  club: ClubSummary;
  admin?: boolean;
}

export default function ItemClub({ club, admin }: itemClubProps) {
  return (
    <div key={club.id} className="flex  gap-4">
      <img
        src={placeholder}
        alt={club.nome}
        className="w-24 h-24 rounded-md border-2 border-gray-300"
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <h2 className="font-medium">{club.nome}</h2>
          {admin && <span className="text-xs text-primary">administrador</span>}
        </div>

        {club.cidade && club.estado && (
          <LocalizationPin cidade={club.cidade} estado={club.estado} />
        )}

        {club.generos && club.generos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {club.generos.map((genero, index) => (
              <Tag key={index}>{genero}</Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
