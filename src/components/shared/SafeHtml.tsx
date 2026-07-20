import DOMPurify from "dompurify";

// Só tags de formatação de texto — conteúdo vem de APIs externas
// (ex.: sinopse do Google Books), então nada de links, imagens ou atributos
const ALLOWED_TAGS = ["b", "strong", "i", "em", "br", "p", "ul", "ol", "li"];

export function SafeHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [],
  });

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
