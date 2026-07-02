import { SearchInput } from "@/components/SearchInput";
import { mockBooks } from "@/mocks/books";
import { FileWarning, Star } from "lucide-react";
import type { BookTemp } from "../types/book";
import { BookImage } from "../components/BookImage";
import { Link } from "react-router-dom";

export default function ListBooks() {
  return (
    <div className="flex flex-col gap-6 mb-10">
      <div>
        <SearchInput
          value={""}
          onChange={function (value: string): void {
            throw new Error("Function not implemented.");
          }}
          placeholder="Buscar livros"
        />
      </div>

      {mockBooks.length === 0 ? (
        <div className="flex flex-col h-[70vh] justify-center items-center text-center gap-5">
          <FileWarning className="inline-block text-gray-300" size={86} />
          Você ainda não está em nenhum clube. <br />
          Crie um clube ou entre em um disponível.
        </div>
      ) : (
        <>
          <p className="font-medium">Livros em alta</p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mockBooks?.map((book: BookTemp) => (
              <Link
                key={book.id ?? book.title_pt}
                className="flex flex-col gap-2 border  rounded-xl p-2 justify-between"
                to={`/livros/${book.id}`}
              >
                <BookImage book={book} />
                <p className="font-medium">{book.title_pt}</p>
                <p className="flex items-center gap-1">
                  {book.global_average_rating ?? "0.0"}
                  <Star className="inline-block" size={16} />
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
