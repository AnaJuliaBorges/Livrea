import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function nameInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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
