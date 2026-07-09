import { ContainerBorder } from "@/components/ContainerBorder";
import type { Club } from "../dtos";
import { LocalizationPin } from "@/components/localizationPin";
import { UsersRound } from "lucide-react";
import { Button } from "@/components/ui";
import { BookImage } from "@/features/books/components/BookImage";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Props {
  club: Club;
}

export default function OverviewSection({ club }: Props) {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return (
    <div className="flex flex-col gap-4 mb-8">
      <ContainerBorder className="text-xs gap-2">
        <p className="font-medium">Descrição</p>
        <p>{club.descricao}</p>
      </ContainerBorder>

      <ContainerBorder className="text-xs gap-2">
        <p className="font-medium">Regras de participação</p>
        <ul>
          {club.regras.map((regra) => (
            <li>{regra}</li>
          ))}
        </ul>
      </ContainerBorder>

      <ContainerBorder className="text-xs gap-1">
        <p className="font-medium mb-1">Encontros</p>
        <p>{club.descricao_encontros}</p>
        <p>
          Próximo encontro: {club.proximo_encontro?.data},{" "}
          {club.proximo_encontro?.local} às {club.proximo_encontro?.horario}
        </p>
        <div className="flex justify-between mt-2">
          <LocalizationPin
            estado={club.estado_sigla}
            cidade={club.cidade_nome}
            size="text-xs"
          />
          <p className="flex gap-2">
            {club.proximo_encontro?.confirmedMembers}/{club.total_participantes}{" "}
            <UsersRound size={14} />
          </p>
        </div>
        <Button
          className="mt-4 text-sm"
          onClick={() => setShowConfirmModal(true)}
        >
          Confirmar presença
        </Button>
      </ContainerBorder>

      <ContainerBorder className="text-xs gap-1">
        <p className="font-medium mb-1">Histórico de leitura</p>
        <div className="flex gap-2">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2">
              {club.historico_leituras.map((book) => (
                <CarouselItem
                  key={book.id}
                  className="pl-2 basis-23"
                  onClick={() => navigate(`/livros/${book.id}`)}
                >
                  <BookImage book={book} height="h-28" />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </ContainerBorder>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 flex flex-col gap-4">
            <h2 className="text-lg font-medium">Confirme sua presença</h2>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <p className="font-medium">Próximo encontro</p>
                <p className="flex gap-2">
                  {club.proximo_encontro?.confirmedMembers}/
                  {club.total_participantes} <UsersRound size={14} />
                </p>
              </div>

              <div className="text-xs flex flex-col gap-1">
                <p>Leitura: {club.leitura_atual?.titulo}</p>
                <p>{club.proximo_encontro?.data}</p>
                <p>
                  {club.proximo_encontro?.local} ás{" "}
                  {club.proximo_encontro?.horario}
                </p>
              </div>

              <LocalizationPin
                estado={club.estado_sigla}
                cidade={club.cidade_nome}
                size="text-xs"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="link" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmModal(false);
                  toast.success("Presença confirmada no encontro!", {
                    position: "top-center",
                    style: {
                      background: "#ECFDF5",
                      color: "var(--color-success)",
                      border: "none",
                      borderRadius: "8px",
                    },
                  });
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
