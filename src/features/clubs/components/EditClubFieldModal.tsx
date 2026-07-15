import { useState } from "react";
import { Button, Textarea } from "@/components/ui";

interface Props {
  title: string;
  placeholder: string;
  initialValue: string;
  isSaving: boolean;
  onSave: (value: string) => void;
  onClose: () => void;
}

// Modal simples de edição de um campo de texto do clube (Descrição/Regras),
// seguindo o padrão de overlay artesanal usado no restante da feature.
export function EditClubFieldModal({
  title,
  placeholder,
  initialValue,
  isSaving,
  onSave,
  onClose,
}: Props) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 flex flex-col gap-4">
        <h2 className="text-lg font-medium">{title}</h2>

        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="min-h-32"
          autoFocus
        />

        <div className="flex gap-3 justify-end">
          <Button variant="link" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(value.trim())} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
