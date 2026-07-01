import { SearchInput } from "@/components/SearchInput";
import ItemClub from "../components/itemClub";
import type { Club } from "../dtos";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { myClubs } from "@/mocks/clubes";

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

      <p className="font-medium">Meus clubes</p>

      <div>
        {myClubs?.map((club: Club) => (
          <>
            <ItemClub key={club.id} club={club} />
            <Separator className="my-4" />
          </>
        ))}
      </div>
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
