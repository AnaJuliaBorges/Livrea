export const formatDate = (date: Date) => {
  return date.toLocaleDateString("pt-BR");
};

export const formatDateString = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR");
};

export const extractYear = (date: string) => {
  return date.match(/\d{4}/)?.[0] ?? date;
};

export function formatRelativeTime(iso: string): string {
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");

  return rtf.format(Math.round(diffHours / 24), "day");
}

export function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";
  return date.toLocaleDateString("pt-BR");
}
