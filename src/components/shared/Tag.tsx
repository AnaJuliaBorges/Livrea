import { cn } from "@/lib/utils";

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-sm bg-[#f1f1f1] px-3 py-1 text-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}
