import { useNavigate, useParams } from "react-router-dom";
import { BookImage } from "../components/BookImage";
import { mockBooks, mockReadingInteraction } from "@/mocks/books";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RegisterReadHistory from "../components/RegisterReadHistory";
import RegisterReadHighlights from "../components/RegisterReadHighlights";
import RegisterReadReview from "../components/RegisterReadReview";
import { useState } from "react";

export default function RegisterRead() {
  const { id } = useParams();
  const navigate = useNavigate();

  const book = mockBooks.find((book) => book.id === id);
  const interaction = mockReadingInteraction;

  return (
    <div>
      <div
        className="py-5 flex gap-4 border-b mb-5"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft />
        <h2>Registro de leitura</h2>
      </div>
      <div className="flex gap-4 items-center mb-8">
        <BookImage book={book} height="h-40" />
        <div>
          <p className="text-lg font-medium">{book?.title_pt}</p>
          <p className="text-sm">{book?.authors}</p>
        </div>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="highlights">Destaques</TabsTrigger>
          <TabsTrigger
            value="review"
            disabled={interaction.total_pages !== interaction.last_progress}
          >
            Resenha
          </TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <RegisterReadHistory interaction={interaction} />
        </TabsContent>
        <TabsContent value="highlights">
          <RegisterReadHighlights interaction={interaction} />
        </TabsContent>
        <TabsContent value="review">
          <RegisterReadReview interaction={interaction} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
