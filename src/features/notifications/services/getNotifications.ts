import { supabase } from "@/lib/supabase";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  url: string | null;
  read: boolean;
  createdAt: string;
}

type RawNotification = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  read: boolean;
  created_at: string;
};

export async function getNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, body, url, read, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  return ((data ?? []) as RawNotification[]).map((notification) => ({
    id: notification.id,
    title: notification.title,
    body: notification.body,
    url: notification.url,
    read: notification.read,
    createdAt: notification.created_at,
  }));
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false);

  if (error) throw error;
}
