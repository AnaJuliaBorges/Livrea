import { BookText, House, MessageCircleMore, User } from "lucide-react";
import { Button } from "../ui";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/livrea_logo_purple_sem_fundo.png";

export default function MenuBar() {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <nav
      className={cn(
        "fixed z-50 border-border bg-background",
        // Mobile
        "bottom-0 left-0 right-0 border-t p-4",
        // Desktop
        "md:top-0 md:bottom-auto md:border-b md:border-t-0 md:px-8 md:py-6",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div
          className="hidden cursor-pointer items-center gap-2 md:flex"
          onClick={() => navigate("/clubes")}
        >
          <img src={logo} alt="Logo" width={48} />
        </div>

        {/* Mobile */}
        <div className="flex w-full justify-around md:hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.includes(item.link);

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => navigate(item.link)}
                className="flex flex-col gap-1"
              >
                <Icon
                  className={cn(
                    "size-6",
                    active ? "text-secondary" : "text-[#A2A2A2]",
                  )}
                />

                <span
                  className={cn(
                    "text-xs",
                    active ? "text-secondary" : "text-[#A2A2A2]",
                  )}
                >
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.link;

            return (
              <Button
                key={item.id}
                variant={"ghost"}
                onClick={() => navigate(item.link)}
                className={cn(
                  "flex items-center gap-4 px-4 py-2 transition-colors text-[#A2A2A2]",
                  active && "text-primary",
                )}
              >
                <Icon className="size-7" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
