import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Duas primeiras iniciais do nome ("Ana Julia Borges" → "AJ")
function nameInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// Avatar de usuário com fallback de iniciais — único lugar dessa composição
// (antes copiada em ~11 componentes). Tamanho via className ("size-8",
// "h-10 w-10"...); `fallback` aparece quando o nome não rende iniciais.
export function UserAvatar({
  name,
  src,
  className,
  fallbackClassName,
  fallback,
}: {
  name: string;
  src?: string | null;
  className?: string;
  fallbackClassName?: string;
  fallback?: React.ReactNode;
}) {
  return (
    <Avatar className={className}>
      <AvatarImage src={src || undefined} alt={name} className="object-cover" />
      <AvatarFallback className={fallbackClassName}>
        {nameInitials(name) || fallback}
      </AvatarFallback>
    </Avatar>
  );
}
