import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ClubMessage } from "../services/clubChat";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({ message }: { message: ClubMessage }) {
  // spoiler começa borrado; clique revela (estado local, por mensagem)
  const [revealed, setRevealed] = useState(false);
  const hidden = message.isSpoiler && !revealed;

  return (
    <div
      className={`flex items-start gap-2 ${message.isMine ? "flex-row-reverse" : ""}`}
    >
      <Avatar className="size-8 shrink-0">
        <AvatarImage
          src={message.author.avatarUrl ?? undefined}
          alt={message.author.name}
          className="object-cover"
        />
        <AvatarFallback className="bg-gray-300 text-xs">
          {initials(message.author.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex max-w-[80%] flex-col gap-1 rounded-lg border bg-white p-3">
        {!message.isMine && (
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm font-medium">{message.author.name}</p>
            {message.author.isAdmin && (
              <p className="text-xs text-muted-foreground">Administrador ✓</p>
            )}
          </div>
        )}

        {hidden ? (
          <button
            type="button"
            aria-label="Revelar spoiler"
            onClick={() => setRevealed(true)}
            className="relative text-left"
          >
            <p aria-hidden className="text-sm blur-sm select-none">
              {message.content}
            </p>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                Alerta de spoiler
              </span>
            </span>
          </button>
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm">
            {message.content}
          </p>
        )}

        <p className="self-end text-[10px] text-muted-foreground">
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
