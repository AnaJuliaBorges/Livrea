import type { Club } from "../dtos";
import placeholder from "../../../assets/placeholder.png";
import { Separator } from "@/components/ui/separator";

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
        {/* Header */}

        <h2 className="font-bold font-medium">{club.nome}</h2>

        {/* Localização */}
        {club.cidade_nome && club.estado_sigla && (
          <div className="flex items-center gap-2 text-sm text-gray-500 ">
            {club.cidade_nome}, {club.estado_sigla}
          </div>
        )}

        {/* Gêneros */}
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

        {/* Informações */}
        {/* <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-xs text-gray-500 uppercase">Participantes</p>
            <p className="font-medium">
              {club.total_participantes}

              <span className="text-sm text-gray-500">
                /{club.limite_participantes || "∞"}
              </span>
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase">Frequência</p>
            <p className="font-medium capitalize">{club.frequencia || "-"}</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}
