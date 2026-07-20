// API pública da feature profile (ver regra de fronteiras em eslint.config.js)
export { useMyProfile } from "./hooks/useMyProfile";
export { useProfileGenreIds } from "./hooks/useProfileGenreIds";
export { useSaveProfileGenres } from "./hooks/useSaveProfileGenres";
export { uploadAvatar } from "./services/uploadAvatar";
export type { ClubSummary, UserProfile } from "./dtos";
