import { BookText, House, MessageCircleMore, User } from "lucide-react";
import { Button } from "./ui";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function MenuBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const sizeIcon = "size-6";

  const menuItems = [
    {
      id: "home",
      icon: House,
      label: "Home",
      link: "/clubes",
    },
    {
      id: "clubes",
      icon: MessageCircleMore,
      label: "Clubes",
      link: "/meus-clubes",
    },
    {
      id: "livros",
      icon: BookText,
      label: "Livros",
      link: "/livros",
    },
    {
      id: "perfil",
      icon: User,
      label: "Perfil",
      link: "/perfil",
    },
  ];

  function goTo(link: string) {
    navigate(link);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4">
      <div className="mx-auto flex justify-around">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.link;

          const Icon = item.icon;

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => goTo(item.link)}
              className="flex flex-col gap-1"
            >
              <Icon
                className={cn(
                  sizeIcon,
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              />

              <span
                className={cn(
                  "text-xs",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
