import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function ProgressRead({
  value,
  label = "concluído",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { label?: string }) {
  return (
    <ProgressPrimitive.Root
      className="relative h-6 w-full overflow-hidden rounded-full bg-gray-100"
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-secondary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />

      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-xs font-medium",
          (value ?? 0) < 55 ? "text-gray-950" : "text-white",
        )}
      >
        {value}% {label}
      </span>
    </ProgressPrimitive.Root>
  );
}

export { ProgressRead };
