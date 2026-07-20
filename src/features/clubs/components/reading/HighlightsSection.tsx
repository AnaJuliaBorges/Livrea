import { useState } from "react";
import { ContainerBorder } from "@/components/shared/ContainerBorder";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import { useClubBookHighlights } from "../../hooks/useClubBookHighlights";
import {
  groupHighlights,
  type HighlightGroup,
} from "../../utils/groupHighlights";

// Modalzinho com quem marcou a citação — cada participante com a página
// da própria edição.
function HighlightParticipantsModal({
  group,
  onClose,
}: {
  group: HighlightGroup;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 flex flex-col gap-4">
        <h2 className="text-sm font-medium">Quem marcou esta citação</h2>

        <p className="text-xs text-muted-foreground italic">"{group.quote}"</p>

        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {group.participants.map((participant) => (
            <div
              key={participant.userId}
              className="flex items-center justify-between"
            >
              <div className="flex gap-2 items-center">
                <UserAvatar
                  name={participant.name}
                  src={participant.avatarUrl}
                  className="h-8 w-8"
                  fallbackClassName="text-xs"
                />
                <p className="text-xs font-medium">{participant.name}</p>
              </div>
              <p className="text-[10px] text-gray-500">
                Página {participant.page}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="link" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

export function HighlightsSection({
  clubId,
  bookId,
  onBack,
}: {
  clubId: string;
  bookId: string;
  onBack: () => void;
}) {
  const { data: highlights, isLoading } = useClubBookHighlights(
    clubId,
    bookId,
  );
  const [selectedGroup, setSelectedGroup] = useState<HighlightGroup | null>(
    null,
  );

  const groups = groupHighlights(highlights ?? []);

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex gap-3 items-center p-2 hover:bg-gray-200 rounded-full transition"
        >
          <ArrowLeft size={20} />
          <h3 className="text-xs font-medium">Destaques</h3>
        </button>
      </div>

      {isLoading ? (
        <ContainerBorder className="items-center text-xs text-muted-foreground">
          Carregando destaques...
        </ContainerBorder>
      ) : groups.length === 0 ? (
        <ContainerBorder className="items-center text-xs text-muted-foreground">
          Nenhum participante destacou trechos deste livro ainda.
        </ContainerBorder>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <button
              key={`${group.participants[0].userId}-${group.page}`}
              type="button"
              className="text-left w-full"
              onClick={() => setSelectedGroup(group)}
            >
              <ContainerBorder className="text-xs">
                "{group.quote}"
                <div className="flex justify-between">
                  <p>Página {group.page}</p>
                  <p className="font-semibold">
                    {group.count === 1
                      ? "1 marcação"
                      : `${group.count} marcações`}
                  </p>
                </div>
              </ContainerBorder>
            </button>
          ))}
        </div>
      )}

      {selectedGroup && (
        <HighlightParticipantsModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
}
