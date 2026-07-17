// Enum club_meeting_type do banco com os rótulos PT — fonte única pra
// filtros e formulários (o wizard de criação ainda usa slugs PT próprios,
// traduzidos na borda pelo service createClub).
export const MEETING_TYPES = [
  { value: "in_person", label: "Presencial" },
  { value: "hybrid", label: "Híbrido" },
  { value: "online", label: "Online" },
] as const;

export type MeetingTypeValue = (typeof MEETING_TYPES)[number]["value"];

// sentinel de filtro inativo nos selects (o Radix não aceita value vazio)
export const FILTER_ALL = "all";
