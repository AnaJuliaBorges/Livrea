import { Button } from "@/components/ui";

interface Props {
  clubName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteClubDialog({
  clubName,
  isDeleting,
  onConfirm,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 flex flex-col gap-4">
        <h2 className="text-lg font-medium">Excluir clube</h2>
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir "{clubName}"? Essa ação não pode ser
          desfeita e todos os participantes, encontros e leituras do clube
          serão apagados.
        </p>

        <div className="flex gap-3 justify-end">
          <Button variant="link" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </div>
    </div>
  );
}
