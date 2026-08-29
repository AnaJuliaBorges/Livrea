import { Users, Monitor, Blend } from "lucide-react";
import { cn } from "@/lib/utils";

const config: Record<string, { label: string; Icon: typeof Users }> = {
  in_person: { label: "Presencial", Icon: Users },
  online: { label: "Online", Icon: Monitor },
  hybrid: { label: "Híbrido", Icon: Blend },
};

export function MeetingTypeTag({
  type,
  variant = "solid",
  className,
}: {
  type: string;
  variant?: "solid" | "soft";
  className?: string;
}) {
  const meetingType = config[type];

  if (!meetingType) return null;

  const { label, Icon } = meetingType;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1",
        variant === "solid"
          ? "rounded-sm bg-secondary/10 px-2 py-0.5 text-xs text-secondary"
          : "text-sm text-gray-500",
        className,
      )}
    >
      <Icon className={variant === "solid" ? "size-3" : "size-3.5"} />
      {label}
    </span>
  );
}
