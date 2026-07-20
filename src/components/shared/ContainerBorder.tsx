import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface ContainerBorderProps {
  className?: string;
}

export function ContainerBorder({
  className,
  children,
}: PropsWithChildren<ContainerBorderProps>) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-xl border p-4", className)}>
      {children}
    </div>
  );
}
