import { MapPin } from "lucide-react";

interface LocalizationPinProps {
  cidade?: string;
  estado?: string;
  color?: string;
  size?: string;
}

export function LocalizationPin({
  cidade,
  estado,
  color,
  size,
}: LocalizationPinProps) {
  return (
    <div
      className={`flex items-center ${size || "text-sm"} ${color || "text-gray-500"}`}
    >
      <MapPin className={`inline-block h-4 ${color || "text-gray-500"}`} />
      {cidade || ""}, {estado || ""}
    </div>
  );
}
