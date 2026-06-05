import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BookSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function BookSearchInput({
  value,
  onChange,
  placeholder = "Buscar livros...",
}: BookSearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
