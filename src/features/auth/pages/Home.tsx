import { Button } from "@/components/ui/button";
import logo from "../../../assets/livrea_logo_purple_sem_fundo.png";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 justify-center items-center h-[80vh]">
      <img src={logo} alt="Logo" width={144} />
      <p className="text-center max-w-sm text-sm">
        Aqui você poderá participar de clubes do livro de acordo com seu gosto,
        disponibilidade e interesse. Aproveite o melhor da literatura trocando
        com outras pessoas!
      </p>
      <div className="flex flex-col gap-4 w-full max-w-sm ">
        <Button onClick={() => navigate("/login")}>Entrar</Button>
        <Button variant="outline" onClick={() => navigate("/cadastrar")}>
          Cadastrar
        </Button>
      </div>
      <p className="text-sm">Ou continue com</p>
      <Button variant="outline" className="w-full max-w-sm ">
        Entrar com o Google
      </Button>
    </div>
  );
}
