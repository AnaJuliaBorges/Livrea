import { supabase } from "@/lib/supabase";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as
  | string
  | undefined;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export type PushPermissionState =
  | "unsupported"
  | "default"
  | "granted"
  | "denied";

export function getPushPermissionState(): PushPermissionState {
  if (!VAPID_PUBLIC_KEY || !isPushSupported()) return "unsupported";
  return Notification.permission;
}

export type PushSubscriptionResult =
  | "subscribed"
  | "denied"
  | "unsupported"
  | "error";

export async function ensurePushSubscription(): Promise<PushSubscriptionResult> {
  try {
    if (!VAPID_PUBLIC_KEY || !isPushSupported()) return "unsupported";

    const permission =
      Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;

    if (permission !== "granted") return "denied";

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return "unsupported";

    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }));

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return "error";

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      return "error";
    }

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: session.user.id,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      },
      { onConflict: "endpoint" },
    );

    if (error) throw error;

    return "subscribed";
  } catch (error) {
    console.error("Erro ao registrar inscrição de push:", error);
    return "error";
  }
}
