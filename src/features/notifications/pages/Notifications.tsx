import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BackButton } from "@/components/BackButton";
import { ContainerBorder } from "@/components/ContainerBorder";
import { Button } from "@/components/ui";
import { BellOff, BellRing } from "lucide-react";
import {
  ensurePushSubscription,
  getPushPermissionState,
} from "@/lib/push";
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

  // permissão de push neste aparelho — o banner some assim que inscrever
  const [permissionState, setPermissionState] = useState(
    getPushPermissionState,
  );
  const [subscribing, setSubscribing] = useState(false);

  const handleEnablePush = async () => {
    setSubscribing(true);
    const result = await ensurePushSubscription();
    setSubscribing(false);
    setPermissionState(getPushPermissionState());

    if (result === "subscribed") {
      toast.success("Notificações ativadas neste aparelho!");
    } else if (result === "denied") {
      toast.error(
        "Permissão negada — libere as notificações nas configurações do navegador.",
      );
    } else {
      toast.error("Não foi possível ativar as notificações neste aparelho.");
    }
  };

  // abrir a tela marca tudo como lida (uma vez, quando os dados chegam)
  useEffect(() => {
    if (alreadyMarked.current) return;
    if (notifications?.some((notification) => !notification.read)) {
      alreadyMarked.current = true;
      markAllRead.mutate();
    }
  }, [notifications, markAllRead]);

  return (
    <div className="flex flex-col gap-4 mb-10 md:mx-auto md:w-full md:max-w-2xl">
      <div className="flex items-center gap-2">
        <BackButton className="md:hidden" />
        <h1 className="text-lg font-medium">Notificações</h1>
      </div>

      {permissionState === "default" && (
        <ContainerBorder className="text-xs gap-2">
          <div className="flex items-center gap-2">
            <BellRing size={16} className="shrink-0 text-primary" />
            <p>
              Ative as notificações pra saber na hora dos pedidos e novidades
              dos seus clubes.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleEnablePush}
            disabled={subscribing}
            className="self-start"
          >
            {subscribing ? "Ativando..." : "Ativar notificações"}
          </Button>
        </ContainerBorder>
      )}

      {permissionState === "denied" && (
        <ContainerBorder className="text-xs text-muted-foreground">
          As notificações estão bloqueadas neste navegador — pra recebê-las,
          libere a permissão nas configurações do site.
        </ContainerBorder>
      )}

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
