// API pública da feature feed (ver regra de fronteiras em eslint.config.js).
// A page NÃO é exportada — só main.tsx a importa (code splitting por rota).
export { useFeed } from "./hooks/useFeed";
export type { FeedEvent } from "./services/getFeed";
