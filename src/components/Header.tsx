import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger onClick={() => navigate("/")}>Home</MenubarTrigger>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger onClick={() => navigate("/clubes")}>
          Clubes
        </MenubarTrigger>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger onClick={() => navigate("/login")}>
          Login
        </MenubarTrigger>
      </MenubarMenu>
    </Menubar>
  );
}
