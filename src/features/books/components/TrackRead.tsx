import { Button } from "@/components/ui";
import { ClipboardList, PencilLine } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TrackRead({ bookId }: { bookId: string }) {
  const navigate = useNavigate();

  return (
    <div
      className="flex justify-between text-sm items-center border p-2 rounded-xl"
      onClick={() => navigate(`/livros/${bookId}/registro`)}
    >
      <div className="flex gap-4 items-center">
        <ClipboardList />
        <p>Registro de leitura</p>
      </div>
      <Button variant="ghost" size="sm" className="text-sm text-primary">
        Editar <PencilLine />
      </Button>
    </div>
  );
}
