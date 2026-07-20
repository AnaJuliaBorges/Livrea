import { useState } from "react";
import { SearchInput } from "@/components/shared/SearchInput";
import ItemClub from "../components/ItemClub";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useListClubs } from "../hooks/useListClubs";
import type { ClubListItem } from "../dtos";

export default function MyClubs() {
  const navigate = useNavigate();
  const { data: clubs, isLoading, error } = useListClubs({ onlyMine: true });
  const [search, setSearch] = useState("");

  const filteredClubs = (clubs ?? []).filter((club) =>
    club.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  let content;

  if (isLoading) {
    content = <div className="text-center py-8">Carregando clubes...</div>;
  } else if (error) {
    content = (
      <div className="text-center py-8">
        <p className="text-red-600">❌ Erro ao carregar seus clubes</p>
      </div>
    );
  } else if ((clubs ?? []).length === 0) {
    content = (
      <div className="flex flex-col h-[70vh] justify-center items-center text-center gap-5">
        <Search className="inline-block text-gray-300" size={86} />
        Você ainda não está em nenhum clube. <br />
        Crie um clube ou entre em um disponível.
      </div>
    );
  } else if (filteredClubs.length === 0) {
    content = (
      <div className="text-center py-8 text-gray-600">
        Nenhum clube encontrado com esse nome.
      </div>
    );
  } else {
    content = (
      <>
        <p className="font-medium">Meus clubes</p>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
          {filteredClubs.map((club: ClubListItem) => (
            <div key={club.id}>
              <ItemClub club={club} admin={club.isAdmin} />
              <Separator className="my-4" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6 mb-24">
      <div className="md:flex md:items-center md:gap-4">
        <div className="md:flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar clubes"
          />
        </div>
        <Button
          className="hidden h-12 md:inline-flex"
          onClick={() => navigate("/meus-clubes/criar")}
        >
          Criar clube
        </Button>
      </div>

      {content}

      <div className="fixed bottom-24 left-0 right-0 z-20 w-full md:hidden">
        <div className="mx-auto max-w-3xl px-4">
          <Button
            className="h-12 w-full"
            onClick={() => navigate("/meus-clubes/criar")}
          >
            Criar clube
          </Button>
        </div>
      </div>
    </div>
  );
}
