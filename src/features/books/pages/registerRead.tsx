import { useNavigate, useParams } from "react-router-dom";
import { BookImage } from "../components/BookImage";
import { mockBooks, mockReadingInteraction } from "@/mocks/books";
import { ArrowLeft, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, Input, Textarea } from "@/components/ui";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function RegisterRead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRegisterHighlight, setShowRegisterHighlight] = useState(false);
  const [newQuote, setNewQuote] = useState("");
  const [newQuotePage, setNewQuotePage] = useState("");

  const [currentPage, setCurrentPage] = useState(
    mockReadingInteraction.last_progress,
  );
  const [feelingSelected, setFeelingSelected] = useState("");

  const [highlights, setHighlights] = useState(
    mockReadingInteraction.highlights,
  );

  console.log({ currentPage });

  const book = mockBooks.find((book) => book.id === id);
  const interaction = mockReadingInteraction;

  function saveQuote(): void {
    setHighlights((prev) => [
      ...prev,
      {
        page: Number(newQuotePage),
        percentage: Math.round(
          (Number(newQuotePage) / interaction.total_pages) * 100,
        ),
        quote: newQuote,
      },
    ]);

    setNewQuote("");
    setNewQuotePage("");
  }

  const feelings = [
    { label: "Não curti", emoji: "☹️​" },
    { label: "Meh", emoji: "🙁​" },
    { label: "Ok", emoji: "😐​" },
    { label: "Gostei", emoji: "🙂​" },
    { label: "Amei", emoji: "😁" },
  ];

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
          <TabsTrigger value="review">Resenha</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <div>
            <div className="flex flex-col gap-4 border p-4 rounded-xl">
              <p className="text-sm font-medium">Progresso da leitura</p>
              <div className="flex flex-col gap-5 bg-gray-200 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">Página atual</p>
                  <div className="flex gap-2 items-center">
                    <Button
                      className="bg-white text-primary font-semibold rounded-xl"
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage == 1}
                    >
                      -
                    </Button>

                    <p>
                      <span className="text-xl font-bold">{currentPage}</span>/
                      <span className="text-xs font-medium">
                        {interaction.total_pages}
                      </span>
                    </p>

                    <Button
                      className="bg-white text-primary font-semibold rounded-xl"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={
                        currentPage == mockReadingInteraction.total_pages
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">
                    Como você se sentiu?{" "}
                  </p>
                  <div className="flex justify-around">
                    {feelings.map((feeling) => (
                      <div className="flex flex-col gap-1 items-center">
                        <Button
                          className={cn(
                            "bg-gray-100 rounded-xl text-2xl py-6 px-3 opacity-60",
                            feelingSelected === feeling.label &&
                              "bg-primary opacity-100",
                          )}
                          onClick={() => setFeelingSelected(feeling.label)}
                        >
                          {feeling.emoji}​
                        </Button>
                        <p className="text-xs">{feeling.label}​</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="highlights">
          <div>
            <div className="flex flex-col gap-4 border p-4 rounded-xl mb-7">
              <p className="text-sm font-medium">Destaques</p>
              {highlights.map((highlight) => (
                <div className="bg-gray-200 p-4 border-l-3 border-primary rounded-xl">
                  <p className="text-sm">"{highlight.quote}"</p>
                  <p className="text-xs text-primary font-medium mt-3">
                    pág {highlight.page}
                  </p>
                </div>
              ))}

              {showRegisterHighlight && (
                <div className="bg-gray-200 flex flex-col gap-3 p-4 border-l-3 border-primary rounded-xl">
                  <Textarea
                    className="bg-white"
                    placeholder="Citação"
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                  />
                  <Input
                    className="bg-white"
                    placeholder="Número da página"
                    value={newQuotePage}
                    onChange={(e) => setNewQuotePage(e.target.value)}
                  />
                  <Button
                    className="self-start text-sm text-primary"
                    variant="ghost"
                    size="sm"
                    onClick={() => saveQuote()}
                  >
                    Salvar
                  </Button>
                </div>
              )}

              <Button
                className="self-start text-sm text-primary"
                variant="ghost"
                size="sm"
                onClick={() => setShowRegisterHighlight(!showRegisterHighlight)}
              >
                {showRegisterHighlight ? "Cancelar" : "Adicionar"}
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="review">
          {interaction.review ? (
            <div>
              <div className="flex flex-col gap-4 border p-4 rounded-xl mb-7">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Sua avaliação</p>
                  <p className="flex items-center gap-1">
                    {interaction.review?.rating ?? "0.0"}
                    <Star className="inline-block" size={21} />
                  </p>
                </div>
                <p>"{interaction.review?.review}"</p>
              </div>

              <Button className="w-full mt-10">Editar avaliação</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 border p-4 items-center rounded-xl mt-7">
              Avaliação ainda não publicada
              <Button>Fazer avaliação</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
