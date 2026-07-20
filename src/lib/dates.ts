// Formatação de datas do app inteiro (pt-BR). Antes espalhada por
// features/books/utils, Notifications e ClubChat.

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("pt-BR");
};

export const formatDateString = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR");
};

// publisher_date vem das APIs em formatos variados ("2018-04-26",
// "2018", "April 2018") — extrai só o ano
export const extractYear = (date: string) => {
  return date.match(/\d{4}/)?.[0] ?? date;
};

// "há 5 min", "há 3 h", "ontem", "há 4 dias"...
export function formatRelativeTime(iso: string): string {
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");

  return rtf.format(Math.round(diffHours / 24), "day");
}

// "Hoje", "Ontem" ou a data por extenso — rótulo dos grupos do chat
export function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";
  return date.toLocaleDateString("pt-BR");
}
