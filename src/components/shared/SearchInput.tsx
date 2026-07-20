import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar livros...",
}: SearchInputProps) {
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[50px]"
      />
      <Search className="absolute right-5 top-4 h-5 w-5 text-muted-foreground" />
    </div>
  );
}
