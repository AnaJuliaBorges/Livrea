// Paleta de cores de header (clubes e perfis). As chaves são o que vai pro
// banco (clubs.header_color / profiles.header_color, validadas por check
// constraint — manter em sincronia com supabase/sql). O gradiente desce na
// vertical e termina no tom 950 da própria cor (nunca preto puro); ainda
// assim escuro o bastante pros botões/ícones claros do header (text-gray-300).
export const HEADER_COLORS = {
  purple: {
    label: "Roxo",
    gradient: "bg-linear-to-b from-violet-800 via-purple-900 to-purple-950",
  },
  blue: {
    label: "Azul",
    gradient: "bg-linear-to-b from-blue-800 via-indigo-900 to-indigo-950",
  },
  teal: {
    label: "Verde",
    gradient: "bg-linear-to-b from-emerald-800 via-teal-900 to-teal-950",
  },
  rose: {
    label: "Rosa",
    gradient: "bg-linear-to-b from-pink-700 via-rose-900 to-rose-950",
  },
  amber: {
    label: "Âmbar",
    gradient: "bg-linear-to-b from-amber-700 via-orange-900 to-orange-950",
  },
  slate: {
    label: "Grafite",
    gradient: "bg-linear-to-b from-slate-600 via-slate-700 to-slate-900",
  },
} as const;

export type HeaderColor = keyof typeof HEADER_COLORS;

export const DEFAULT_HEADER_COLOR: HeaderColor = "purple";

// aceita qualquer string do banco e cai no padrão se for desconhecida;
// sem argumento devolve o gradiente padrão (headers não customizáveis)
export function headerGradient(color?: string | null): string {
  const key = (color ?? DEFAULT_HEADER_COLOR) as HeaderColor;
  return (HEADER_COLORS[key] ?? HEADER_COLORS[DEFAULT_HEADER_COLOR]).gradient;
}
