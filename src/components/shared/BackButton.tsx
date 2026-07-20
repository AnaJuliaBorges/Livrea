import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Botão de voltar neutro — o posicionamento/cores ficam por conta de quem
// usa (ex.: sobre banners, passar absolute + cores claras via className).
export function BackButton({ className }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate(-1)}
      className={cn("rounded-full", className)}
    >
      <ArrowLeft className="size-6" />
    </Button>
  );
}
