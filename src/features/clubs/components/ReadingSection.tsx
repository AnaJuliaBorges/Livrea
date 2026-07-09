import { ContainerBorder } from "@/components/ContainerBorder";
import type { Club } from "../dtos";
import { mockBooks } from "@/mocks/books";
import { BookImage } from "@/features/books/components/BookImage";
import {
  BookmarkMinus,
  ChevronRight,
  NotepadText,
  PencilLine,
  Star,
  ArrowLeft,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui";
import { ProgressRead } from "@/components/ProgressRead";
import { mockClubInteractions, type ClubInteractions } from "@/mocks/clubes";
import { useState } from "react";
import { ReviewCard } from "@/features/books/components/ReviewCard";

interface Props {
  club: Club;
}

function HighlightsSection({
  onBack,
  interactions,
}: {
  onBack: () => void;
  interactions: ClubInteractions;
}) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex gap-3 items-center p-2 hover:bg-gray-200 rounded-full transition"
        >
          <ArrowLeft size={20} />
          <h3 className="text-xs font-medium">Destaques</h3>
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {interactions.destaques.map((destaque) => (
          <ContainerBorder className="text-xs">
            "{destaque.texto}"
            <div className="flex justify-between">
              <p>Página {destaque.pagina}</p>
              <p className="font-semibold">
                {destaque.total_marcacoes} marcações
              </p>
            </div>
          </ContainerBorder>
        ))}
      </div>
    </div>
  );
}

function ReviewsSection({
  onBack,
  interactions,
}: {
  onBack: () => void;
  interactions: ClubInteractions;
}) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex gap-3 items-center p-2 hover:bg-gray-200 rounded-full transition"
        >
          <ArrowLeft size={20} />
          <h3 className="text-xs font-medium">Resenhas</h3>
        </button>
      </div>
      {interactions.avaliacoes.map((review) => (
        <ContainerBorder>
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <UserRound size={20} />
              <p className="text-xs font-medium">{review.usuario.nome}</p>
            </div>

            <p className="text-xs flex font-semibold gap-1">
              {review.nota} <Star size={16} />
            </p>
          </div>

          <p className="text-xs">{review.resenha}</p>
        </ContainerBorder>
      ))}
    </div>
  );
}

function ReadersSection({
  onBack,
  interactions,
}: {
  onBack: () => void;
  interactions: ClubInteractions;
}) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <button
        onClick={onBack}
        className="flex gap-3 items-center p-2 hover:bg-gray-200 rounded-full transition"
      >
        <ArrowLeft size={20} />
        <h3 className="text-xs font-medium">Leitores</h3>
      </button>

      <div className="flex flex-col gap-2">
        {interactions.progresso_participantes
          .sort((a, b) => b.progresso - a.progresso)
          .map((member) => (
            <ContainerBorder className="text-xs flex-row justify-between items-center">
              <div className="flex gap-2 items-center">
                <UserRound size={20} />
                <div className="flex flex-col">
                  <p className="text-xs font-medium">{member.usuario.nome}</p>
                  <p className="text-[10px] text-gray-500">
                    {member.administrador
                      ? "Administrador"
                      : `Membro desde ${member.entrou_em}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {member.progresso === 100 && (
                  <p className="text-xs flex items-center font-semibold gap-1">
                    {member.nota} <Star size={16} />
                  </p>
                )}
                <p className="text-[10px]">{member.progresso}% lido</p>
              </div>
            </ContainerBorder>
          ))}
      </div>
    </div>
  );
}

export default function ReadingSection({ club }: Props) {
  const book = mockBooks.find((book) => book.id === club.leitura_atual?.id);
  const interactions = mockClubInteractions;

  const [activeTab, setActiveTab] = useState("");

  const navigate = useNavigate();

  if (activeTab === "highlights") {
    return (
      <HighlightsSection
        interactions={interactions}
        onBack={() => setActiveTab("")}
      />
    );
  }

  if (activeTab === "reviews") {
    return (
      <ReviewsSection
        onBack={() => setActiveTab("")}
        interactions={interactions}
      />
    );
  }

  if (activeTab === "readers") {
    return (
      <ReadersSection
        onBack={() => setActiveTab("")}
        interactions={interactions}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 mb-8">
      <div onClick={() => navigate(`/livros/${book?.id}`)}>
        <p className="font-medium text-xs">Leitura atual</p>
        <ContainerBorder className="flex-row justify-between items-center mt-2">
          <BookImage book={book} height="h-28" />
          <div className="text-xs">
            <p className="font-medium">{book?.title_pt}</p>
            <p>{book?.authors}</p>
            <p>{book?.publisher}</p>
            <p>{book?.primary_genre.name}</p>
            <p>{book?.total_pages} páginas</p>
          </div>
          <ChevronRight />
        </ContainerBorder>
      </div>

      <ContainerBorder className="text-xs">
        <p className="font-medium ">Avaliação do livro</p>
        <Separator />
        <p className="flex justify-between">
          <span className="flex gap-1">
            Global: {book?.global_average_rating} <Star size={16} />
          </span>{" "}
          |{" "}
          <span className="flex gap-1">
            Clube: {book?.global_average_rating} <Star size={16} />
          </span>{" "}
          |{" "}
          <span className="flex gap-1">
            Individual: {book?.global_average_rating} <Star size={16} />
          </span>
        </p>
        <div className="flex justify-between gap-2">
          <button onClick={() => setActiveTab("highlights")} className="w-full">
            <ContainerBorder className="flex-1 gap-1 items-center">
              <PencilLine />
              <p className="text-[10px]">Destaques</p>
            </ContainerBorder>
          </button>
          <button onClick={() => setActiveTab("reviews")} className="w-full">
            <ContainerBorder className="flex-1 gap-1 items-center">
              <BookmarkMinus />
              <p className="text-[10px]">Resenhas</p>
            </ContainerBorder>
          </button>
          <button onClick={() => setActiveTab("readers")} className="w-full">
            <ContainerBorder className="flex-1 gap-1 items-center">
              <NotepadText />
              <p className="text-[10px]">Leitores</p>
            </ContainerBorder>
          </button>
        </div>
        <Separator />
        <div className="w-full flex flex-col gap-2 items-center mt-0">
          <ProgressRead value={78} label="" />
          <p>dos participantes já leram o livro</p>
        </div>
      </ContainerBorder>
    </div>
  );
}
