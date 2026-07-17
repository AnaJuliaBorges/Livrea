// Normaliza texto pra busca: remove acentos (decomposição NFD) e baixa a
// caixa — "Poesía" e "poesia" viram a mesma coisa.
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
