import { BookText, House, MessageCircleMore, User } from "lucide-react";
import { Button } from "./ui";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function MenuBar() {
  const navigate = useNavigate();

  const sizeIcon = "size-6 size-6";

  const menuItems = [
    {
      id: "home",
      icon: <House className={cn(sizeIcon)} />,
      label: "Home",
      link: "/clubes",
    },
    {
      id: "clubes",
      icon: <MessageCircleMore className={cn(sizeIcon)} />,
      label: "Clubes",
      link: "/meus-clubes",
    },
    {
      id: "livros",
      icon: <BookText className={cn(sizeIcon)} />,
      label: "Livros",
      link: "/livros",
    },
    {
      id: "perfil",
      icon: <User className={cn(sizeIcon)} />,
      label: "Perfil",
      link: "/perfil",
    },
  ];

  function goTo(link: string) {
    navigate(link);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4">
      <div className="mx-auto flex  justify-around">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => goTo(item.link)}
            className="flex flex-col"
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
