import { MapPin } from "lucide-react";

interface LocalizationPinProps {
  city?: string;
  state?: string;
  color?: string;
  size?: string;
}

export function LocalizationPin({
  city,
  state,
  color,
  size,
}: LocalizationPinProps) {
  return (
    <div
      className={`flex items-center ${size || "text-sm"} ${color || "text-gray-500"}`}
    >
      <MapPin className={`inline-block h-4 ${color || "text-gray-500"}`} />
      {city || ""}, {state || ""}
    </div>
  );
}
