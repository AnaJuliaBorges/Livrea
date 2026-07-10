import { SearchInput } from "@/components/SearchInput";
import ItemClub from "../components/ItemClub";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { myClubSummaries } from "@/mocks/clubsSummary";
import type { ClubSummary } from "@/features/profile/dtos";

export default function MyClubs() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SearchInput
          value={""}
          onChange={function (value: string): void {
            throw new Error("Function not implemented.");
          }}
          placeholder="Buscar clubes"
        />
      </div>

      {myClubSummaries.length === 0 ? (
        <div className="flex flex-col h-[70vh] justify-center items-center text-center gap-5">
          <Search className="inline-block text-gray-300" size={86} />
          Você ainda não está em nenhum clube. <br />
          Crie um clube ou entre em um disponível.
        </div>
      ) : (
        <>
          <p className="font-medium">Meus clubes</p>

          <div>
            {myClubSummaries?.map((club: ClubSummary) => (
              <>
                <ItemClub key={club.id} club={club} />
                <Separator className="my-4" />
              </>
            ))}
          </div>
        </>
      )}

      <div className="fixed bottom-24 left-0 right-0 z-20 w-full">
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
