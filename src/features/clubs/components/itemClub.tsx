import type { Club } from "../dtos";
import placeholder from "../../../assets/placeholder.png";
import { MapPin } from "lucide-react";

interface itemClubProps {
  club: Club;
}

export default function ItemClub({ club }: itemClubProps) {
  return (
    <div key={club.id} className="flex  gap-4">
      <img
        src={placeholder}
        alt={club.nome}
        className="w-24 h-24 rounded-md border-2 border-gray-300"
      />
      <div className="flex flex-col gap-2">
        <h2 className="font-medium">{club.nome}</h2>

        {club.cidade_nome && club.estado_sigla && (
          <div className="flex items-center gap-2 text-sm text-gray-500 ">
            <MapPin className="inline-block text-gray-500" size={16} />
            {club.cidade_nome}, {club.estado_sigla}
          </div>
        )}

        {club.generos && club.generos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {club.generos.map((genero) => (
              <span
                key={genero.id}
                className="px-3 py-1 bg-[#f1f1f1] rounded-sm text-sm"
              >
                {genero.nome}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
