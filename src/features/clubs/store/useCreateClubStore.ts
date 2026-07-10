import { create } from "zustand";

interface CreateClubStore {
  clubName: string;
  description: string;
  rules: string;
  frequency: string;
  customFrequency: string;
  meetingType: string;
  state: string;
  city: string;
  privacy: string;
  hasLimit: string;
  maxParticipants: string;
  meetingDescription: string;
  selectedGenres: number[];
  setClubName: (value: string) => void;
  setDescription: (value: string) => void;
  setRules: (value: string) => void;
  setFrequency: (value: string) => void;
  setCustomFrequency: (value: string) => void;
  setMeetingType: (value: string) => void;
  setState: (value: string) => void;
  setCity: (value: string) => void;
  setPrivacy: (value: string) => void;
  setHasLimit: (value: string) => void;
  setMaxParticipants: (value: string) => void;
  setMeetingDescription: (value: string) => void;
  toggleGenre: (genreId: number) => void;
  reset: () => void;
}

const initialState = {
  clubName: "",
  description: "",
  rules: "",
  frequency: "",
  customFrequency: "",
  meetingType: "presencial",
  state: "",
  city: "",
  privacy: "publico",
  hasLimit: "nao",
  maxParticipants: "",
  meetingDescription: "",
  selectedGenres: [] as number[],
};

export const useCreateClubStore = create<CreateClubStore>((set) => ({
  ...initialState,
  setClubName: (value) => set({ clubName: value }),
  setDescription: (value) => set({ description: value }),
  setRules: (value) => set({ rules: value }),
  setFrequency: (value) => set({ frequency: value }),
  setCustomFrequency: (value) => set({ customFrequency: value }),
  setMeetingType: (value) => set({ meetingType: value }),
  setState: (value) => set({ state: value, city: "" }),
  setCity: (value) => set({ city: value }),
  setPrivacy: (value) => set({ privacy: value }),
  setHasLimit: (value) => set({ hasLimit: value }),
  setMaxParticipants: (value) => set({ maxParticipants: value }),
  setMeetingDescription: (value) => set({ meetingDescription: value }),
  toggleGenre: (genreId) =>
    set((state) => ({
      selectedGenres: state.selectedGenres.includes(genreId)
        ? state.selectedGenres.filter((id) => id !== genreId)
        : [...state.selectedGenres, genreId],
    })),
  reset: () => set(initialState),
}));
