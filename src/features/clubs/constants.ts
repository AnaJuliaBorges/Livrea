export const MEETING_TYPES = [
  { value: "in_person", label: "Presencial" },
  { value: "hybrid", label: "Híbrido" },
  { value: "online", label: "Online" },
] as const;

export type MeetingTypeValue = (typeof MEETING_TYPES)[number]["value"];

export const FILTER_ALL = "all";
