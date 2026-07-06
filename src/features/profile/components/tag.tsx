import type { ReactNode } from "react";

export function Tag({
  label,
  active,
  icon,
  color,
  onClick,
}: {
  label: string;
  color: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`px-4 py-2 flex gap-2 items-center rounded-full text-xs font-medium bg-gray-200 ${active && color}`}
      onClick={onClick}
    >
      {icon}
      {label}
    </div>
  );
}
