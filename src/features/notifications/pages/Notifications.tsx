import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { ContainerBorder } from "@/components/ContainerBorder";
import { BellOff } from "lucide-react";
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from "../hooks/useNotifications";

// "há 5 min", "há 3 h", "ontem", "há 4 dias"...
function formatRelativeTime(iso: string): string {
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");

  return rtf.format(Math.round(diffHours / 24), "day");
}

export default function Notifications() {
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const alreadyMarked = useRef(false);

  // abrir a tela marca tudo como lida (uma vez, quando os dados chegam)
  useEffect(() => {
    if (alreadyMarked.current) return;
    if (notifications?.some((notification) => !notification.read)) {
      alreadyMarked.current = true;
      markAllRead.mutate();
    }
  }, [notifications, markAllRead]);

  return (
    <div className="flex flex-col gap-4 mb-10">
      <div className="flex items-center gap-2">
        <BackButton />
        <h1 className="text-lg font-medium">Notificações</h1>
      </div>

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Carregando notificações...
        </p>
      ) : (notifications ?? []).length === 0 ? (
        <div className="flex flex-col items-center gap-3 mt-16 text-muted-foreground">
          <BellOff size={40} className="text-gray-300" />
          <p className="text-sm">Nenhuma notificação por aqui ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {(notifications ?? []).map((notification) => (
            <button
              key={notification.id}
              type="button"
              className="text-left w-full"
              onClick={() => notification.url && navigate(notification.url)}
            >
              <ContainerBorder className="text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium flex items-center gap-2">
                    {!notification.read && (
                      <span
                        aria-label="não lida"
                        className="h-2 w-2 shrink-0 rounded-full bg-primary"
                      />
                    )}
                    {notification.title}
                  </p>
                  <p className="text-[10px] text-gray-500 shrink-0">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>
                <p>{notification.body}</p>
              </ContainerBorder>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
