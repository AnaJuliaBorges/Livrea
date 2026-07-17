import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";
import { BackButton } from "@/components/BackButton";
import placeholder from "../../../assets/placeholder.png";
import { headerGradient } from "@/lib/headerColors";
import { useClub } from "@/features/clubs/hooks/useClub";
import { useClubMessages, useSendClubMessage } from "../hooks/useClubChat";
import { MessageBubble } from "../components/MessageBubble";
import type { ClubMessage } from "../services/clubChat";

function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";
  return date.toLocaleDateString("pt-BR");
}

// mensagens agrupadas por dia, na ordem em que chegaram
function groupByDay(messages: ClubMessage[]) {
  const groups: { label: string; messages: ClubMessage[] }[] = [];

  for (const message of messages) {
    const label = dayLabel(message.createdAt);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.label === label) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ label, messages: [message] });
    }
  }

  return groups;
}

export default function ClubChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: club, isLoading } = useClub(id);
  const isMember = club?.isMember ?? false;
  const { data: messages } = useClubMessages(id, isMember);
  const sendMessage = useSendClubMessage(id ?? "");

  const [draft, setDraft] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messageCount = messages?.length ?? 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messageCount]);

  if (isLoading) {
    return (
      <p className="mt-20 text-center text-muted-foreground">
        Carregando chat...
      </p>
    );
  }

  if (!club || !isMember) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-gray-600">
          Só participantes do clube têm acesso ao chat.
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 size-4" />
          Voltar
        </Button>
      </div>
    );
  }

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sendMessage.isPending) return;

    sendMessage.mutate(
      { content, isSpoiler },
      {
        onSuccess: () => {
          setDraft("");
          setIsSpoiler(false);
        },
        onError: (error) => {
          console.error("Error sending club message:", error);
          toast.error("Não foi possível enviar a mensagem. Tente novamente.");
        },
      },
    );
  };

  return (
    <div className="flex flex-col">
      <div
        className={`relative left-1/2 -mt-6 w-screen -translate-x-1/2 ${headerGradient(club.headerColor)}`}
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <BackButton className="text-gray-200 hover:bg-white/20" />
          <img
            src={club.coverUrl ?? placeholder}
            alt={club.name}
            className="h-10 w-10 rounded-md border object-cover"
          />
          <div className="text-white">
            <p className="font-medium">{club.name}</p>
            <p className="text-xs text-gray-300">
              {club.totalParticipants} participantes
            </p>
          </div>
        </div>
      </div>

      <div className="mb-32 flex flex-col gap-3 py-4">
        {messageCount === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Nenhuma mensagem ainda. Comece a conversa!
          </p>
        )}

        {groupByDay(messages ?? []).map((group) => (
          <div key={group.label} className="flex flex-col gap-3">
            <p className="text-center text-xs text-muted-foreground">
              {group.label}
            </p>
            {group.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="fixed bottom-18 left-0 right-0 z-40 px-4 py-3 backdrop-blur"
      >
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2">
          <button
            type="button"
            aria-label="Marcar como spoiler"
            aria-pressed={isSpoiler}
            title="Marcar como spoiler"
            onClick={() => setIsSpoiler((current) => !current)}
            className={`rounded-full border p-2 transition ${
              isSpoiler
                ? "border-primary bg-primary/10 text-primary"
                : "text-gray-400"
            }`}
          >
            <TriangleAlert className="size-5" />
          </button>

          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={isSpoiler ? "Mensagem com spoiler" : "Mensagem"}
            className="rounded-full bg-white"
          />

          <Button
            type="submit"
            size="icon"
            aria-label="Enviar mensagem"
            disabled={!draft.trim() || sendMessage.isPending}
            className="rounded-full"
          >
            <Send className="size-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
