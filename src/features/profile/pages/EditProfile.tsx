import { useState } from "react";
import {
  Button,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Download, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function EditProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [biography, setBiography] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className="mb-5 flex items-center gap-4 border-b py-5 text-left"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft />
        <h2>Configurações</h2>
      </button>

      <div className="flex flex-col items-center gap-2">
        <Avatar className="h-32 w-32">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>AJ</AvatarFallback>
        </Avatar>

        <Button variant="link">
          <Download />
          Alterar foto de perfil
        </Button>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field>
          <Input
            placeholder="Nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        <Field>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>

        <Field>
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>

        <div className="grid gap-4 grid-cols-2">
          <Field>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sp">São Paulo</SelectItem>
                <SelectItem value="rj">Rio de Janeiro</SelectItem>
                <SelectItem value="mg">Minas Gerais</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sao-paulo">São Paulo</SelectItem>
                <SelectItem value="rio">Rio de Janeiro</SelectItem>
                <SelectItem value="belo-horizonte">Belo Horizonte</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field>
          <Textarea
            placeholder="Biografia"
            value={biography}
            onChange={(event) => setBiography(event.target.value)}
            className="min-h-28"
          />
        </Field>
      </form>

      <div className="flex flex-col gap-2">
        <Button type="submit" className="h-12">
          Salvar alterações
        </Button>
        <Button variant="link" className="text-destructive self-start text-sm">
          Sair da conta
          <LogOut />
        </Button>
      </div>
    </div>
  );
}
