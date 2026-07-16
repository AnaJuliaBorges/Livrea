import { ContainerBorder } from "@/components/ContainerBorder";
import { Separator } from "@/components/ui";
import { ProgressRead } from "@/components/ProgressRead";
import type { BookTemp } from "@/features/books/types/book";
import {
  formatRatingValue,
  getBookRatingDisplay,
} from "@/features/books/utils/bookRating";
import { useClubBookRating } from "../../hooks/useClubBookRating";
import { useClubReadingReaders } from "../../hooks/useClubReadingReaders";
import { BookmarkMinus, NotepadText, PencilLine, Star } from "lucide-react";

// Box "Avaliação do livro", reaproveitado pra leitura atual e pra cada item
// do histórico:
//   Global — média geral do livro (local do banco > global do Google > 0.0)
//   Clube — média das notas dos membros do clube pro livro (ao vivo)
//   Individual — a nota do próprio usuário pro livro
export function BookRatingBox({
  book,
  clubId,
  bookId,
  onSelectTab,
  text = "dos participantes já leram o livro",
}: {
  book: BookTemp | undefined;
  clubId: string;
  bookId: string;
  onSelectTab: (tab: string) => void;
  text?: string;
}) {
  const { data: rating } = useClubBookRating(clubId, bookId);
  // mesma query da sub-tela Leitores (cache compartilhado) — daqui sai a
  // porcentagem de participantes que já terminaram o livro
  const { data: readers } = useClubReadingReaders(clubId, bookId);

  const finishedPercent =
    readers && readers.length > 0
      ? Math.round(
          (readers.filter((reader) => reader.progress === 100).length /
            readers.length) *
            100,
        )
      : 0;

  return (
    <ContainerBorder className="text-xs">
      <p className="font-medium ">Avaliação do livro</p>
      <Separator />
      <p className="flex justify-between">
        <span className="flex gap-1">
          Global: {getBookRatingDisplay(book)} <Star size={16} />
        </span>{" "}
        |{" "}
        <span className="flex gap-1">
          Clube: {formatRatingValue(rating?.clubAverage)} <Star size={16} />
        </span>{" "}
        |{" "}
        <span className="flex gap-1">
          Individual: {formatRatingValue(rating?.myRating)} <Star size={16} />
        </span>
      </p>
      <div className="flex justify-between gap-2">
        <button onClick={() => onSelectTab("highlights")} className="w-full">
          <ContainerBorder className="flex-1 gap-1 items-center">
            <PencilLine />
            <p className="text-[10px]">Destaques</p>
          </ContainerBorder>
        </button>
        <button onClick={() => onSelectTab("reviews")} className="w-full">
          <ContainerBorder className="flex-1 gap-1 items-center">
            <BookmarkMinus />
            <p className="text-[10px]">Resenhas</p>
          </ContainerBorder>
        </button>
        <button onClick={() => onSelectTab("readers")} className="w-full">
          <ContainerBorder className="flex-1 gap-1 items-center">
            <NotepadText />
            <p className="text-[10px]">Leitores</p>
          </ContainerBorder>
        </button>
      </div>
      <Separator />
      <div className="w-full flex flex-col gap-2 items-center mt-0">
        <ProgressRead value={finishedPercent} label="" />
        <p>{text}</p>
      </div>
    </ContainerBorder>
  );
}
