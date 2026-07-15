import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Botão de voltar flutuante usado sobre banners/heros (ClubDetails, BookDetail, Profile).
export function BackButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate(-1)}
      className="absolute left-4 top-4 z-10 rounded-full text-gray-300 hover:bg-white/20"
    >
      <ArrowLeft className="size-6" />
    </Button>
  );
}
