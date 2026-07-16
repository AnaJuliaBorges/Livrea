import { Button } from "@/components/ui";

interface Props {
  memberName: string;
  isRemoving: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function RemoveMemberDialog({
  memberName,
  isRemoving,
  onConfirm,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 flex flex-col gap-4">
        <h2 className="text-lg font-medium">Remover participante</h2>
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja remover {memberName} do clube? Ele deixa de
          ser participante e perde acesso ao clube, mas pode pedir para entrar
          de novo depois.
        </p>

        <div className="flex gap-3 justify-end">
          <Button variant="link" onClick={onClose} disabled={isRemoving}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isRemoving}
          >
            {isRemoving ? "Removendo..." : "Remover"}
          </Button>
        </div>
      </div>
    </div>
  );
}
