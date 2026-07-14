import { create } from "zustand";

interface CreateClubStore {
  clubName: string;
  description: string;
  rules: string;
  frequency: string;
  customFrequency: string;
  meetingType: string;
  stateId: string;
  cityId: string;
  privacy: string;
  hasLimit: string;
  maxParticipants: string;
  meetingDescription: string;
  selectedGenres: number[];
  coverFile: File | null;
  setClubName: (value: string) => void;
  setDescription: (value: string) => void;
  setRules: (value: string) => void;
  setFrequency: (value: string) => void;
  setCustomFrequency: (value: string) => void;
  setMeetingType: (value: string) => void;
  setStateId: (value: string) => void;
  setCityId: (value: string) => void;
  setPrivacy: (value: string) => void;
  setHasLimit: (value: string) => void;
  setMaxParticipants: (value: string) => void;
  setMeetingDescription: (value: string) => void;
  setCoverFile: (file: File | null) => void;
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
  stateId: "",
  cityId: "",
  privacy: "publico",
  hasLimit: "nao",
  maxParticipants: "",
  meetingDescription: "",
  selectedGenres: [] as number[],
  coverFile: null as File | null,
};

export const useCreateClubStore = create<CreateClubStore>((set) => ({
  ...initialState,
  setClubName: (value) => set({ clubName: value }),
  setDescription: (value) => set({ description: value }),
  setRules: (value) => set({ rules: value }),
  setFrequency: (value) => set({ frequency: value }),
  setCustomFrequency: (value) => set({ customFrequency: value }),
  setMeetingType: (value) => set({ meetingType: value }),
  setStateId: (value) => set({ stateId: value, cityId: "" }),
  setCityId: (value) => set({ cityId: value }),
  setPrivacy: (value) => set({ privacy: value }),
  setHasLimit: (value) => set({ hasLimit: value }),
  setMaxParticipants: (value) => set({ maxParticipants: value }),
  setMeetingDescription: (value) => set({ meetingDescription: value }),
  setCoverFile: (file) => set({ coverFile: file }),
  toggleGenre: (genreId) =>
    set((state) => ({
      selectedGenres: state.selectedGenres.includes(genreId)
        ? state.selectedGenres.filter((id) => id !== genreId)
        : [...state.selectedGenres, genreId],
    })),
  reset: () => set(initialState),
}));
