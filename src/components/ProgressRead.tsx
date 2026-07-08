import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function ProgressRead({
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root className="relative h-6 w-full overflow-hidden rounded-full bg-gray-100">
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />

      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-xs font-medium",
          value < 55 ? "text-gray-950" : "text-white",
        )}
      >
        {value}% concluído
      </span>
    </ProgressPrimitive.Root>
  );
}

export { ProgressRead };
