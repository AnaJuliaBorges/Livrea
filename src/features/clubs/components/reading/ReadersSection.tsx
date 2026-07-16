import { ContainerBorder } from "@/components/ContainerBorder";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Star } from "lucide-react";
import { useClubReadingReaders } from "../../hooks/useClubReadingReaders";

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ReadersSection({
  clubId,
  bookId,
  onBack,
}: {
  clubId: string;
  bookId: string;
  onBack: () => void;
}) {
  const { data: readers, isLoading } = useClubReadingReaders(clubId, bookId);

  return (
    <div className="flex flex-col gap-4 mb-8">
      <button
        onClick={onBack}
        className="flex gap-3 items-center p-2 hover:bg-gray-200 rounded-full transition"
      >
        <ArrowLeft size={20} />
        <h3 className="text-xs font-medium">Leitores</h3>
      </button>

      {isLoading ? (
        <ContainerBorder className="items-center text-xs text-muted-foreground">
          Carregando leitores...
        </ContainerBorder>
      ) : (
        <div className="flex flex-col gap-2">
          {(readers ?? []).map((reader) => (
            <ContainerBorder
              key={reader.userId}
              className="text-xs flex-row justify-between items-center"
            >
              <div className="flex gap-2 items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={reader.avatarUrl ?? undefined}
                    alt={reader.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xs">
                    {initialsOf(reader.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-xs font-medium">{reader.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {reader.isAdmin ? "Administrador" : "Membro"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {reader.rating !== null && (
                  <p className="text-xs flex items-center font-semibold gap-1">
                    {reader.rating} <Star size={16} />
                  </p>
                )}
                <p className="text-[10px]">
                  {reader.started ? `${reader.progress}% lido` : "Não começou"}
                </p>
              </div>
            </ContainerBorder>
          ))}
        </div>
      )}
    </div>
  );
}
