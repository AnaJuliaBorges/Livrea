import { useParams } from "react-router-dom";
import { mockBooks } from "@/mocks/books";

export function BookDetail() {
  const { id } = useParams();

  const book = mockBooks.find((book) => book.id === id);

  if (!book) {
    return <p>Livro não encontrado.</p>;
  }

  return (
    <>
      <h1>{book.title_pt}</h1>
      <p>{book.synopsis}</p>
    </>
  );
}
