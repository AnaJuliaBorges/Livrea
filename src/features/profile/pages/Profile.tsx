import { LocalizationPin } from "@/components/LocalizationPin";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ItemClub from "@/features/clubs/components/ItemClub";
import { mockProfile } from "@/mocks/profile";
import {
  ArrowLeft,
  Bookmark,
  BookmarkMinus,
  BookmarkPlus,
  Settings,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tag } from "../components/Tag";
import { BookImage } from "@/features/books/components/BookImage";

export default function Profile() {
  const [tagActive, setTagActive] = useState("read");
  const navigate = useNavigate();

  const qntyReadBooks = mockProfile.biblioteca.lidos.length;
  const qntyClubs = mockProfile.clubes.length;
  const qntyFriends = mockProfile.amigos.length;

  function bookActive() {
    switch (tagActive) {
      case "read":
        return mockProfile.biblioteca.lidos;
      case "reading":
        return mockProfile.biblioteca.lendo;
      case "want-to-read":
        return mockProfile.biblioteca.quero_ler;
      default:
        return [];
    }
  }

  function qntyComponent(qnty: number, label: string) {
    return (
      <div className="flex flex-col justify-center items-center border rounded-xl p-4">
        <p className="text-lg font-bold">{qnty}</p>
        <p className="text-[10px] font-medium">{label}</p>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="relative left-1/2 -mt-6 h-30 w-screen -translate-x-1/2 bg-gradient-to-br from-violet-800 via-purple-900 to-slate-950">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 z-10 rounded-full text-accent-foreground hover:bg-white/20 hover:text-white"
        >
          <ArrowLeft className="size-6" />
        </Button>

        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 ">
          <img
            src={mockProfile.foto}
            className="rounded-full w-32 shadow-xl border-2 border-gray-400"
          />
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium">{mockProfile.nome}</h2>
            <div className="flex gap-4 text-xs">
              <p>{mockProfile.username}</p>
              <LocalizationPin
                cidade={mockProfile.cidade}
                estado={mockProfile.estado}
                color="text-foreground"
                size="text-xs"
              />
            </div>
          </div>
          <Settings onClick={() => navigate("/perfil/editar")} />
        </div>

        <p className="text-xs">"{mockProfile.bio}"</p>

        <div className="grid grid-cols-3 gap-2">
          {qntyComponent(qntyReadBooks, "livros lidos")}
          {qntyComponent(qntyClubs, "clubes")}
          {qntyComponent(qntyFriends, "amigos")}
        </div>

        <Tabs defaultValue="clubs" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="clubs">Meus clubes</TabsTrigger>
            <TabsTrigger value="books">Meus livros</TabsTrigger>
          </TabsList>
          <TabsContent value="clubs">
            <div className="mt-6 ">
              {mockProfile.clubes.map((club) => (
                <>
                  <ItemClub club={club} admin={club.administrador} />
                  <Separator className="my-4" />
                </>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="books">
            <div className="flex gap-2 mt-6">
              <Tag
                label="Lido"
                active={tagActive === "read"}
                icon={<Bookmark className="size-4" />}
                color="bg-success-light"
                onClick={() => setTagActive("read")}
              />
              <Tag
                label="Lendo"
                active={tagActive === "reading"}
                icon={<BookmarkMinus className="size-4" />}
                color="bg-warning-light"
                onClick={() => setTagActive("reading")}
              />
              <Tag
                label="Quero ler"
                active={tagActive === "want-to-read"}
                icon={<BookmarkPlus className="size-4" />}
                color="bg-info-light"
                onClick={() => setTagActive("want-to-read")}
              />
            </div>
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                {bookActive().map((book) => (
                  <Link
                    key={book.id ?? book.titulo}
                    className="flex flex-col gap-2 border  rounded-xl p-2 justify-between"
                    to={`/livros/${book.id}`}
                  >
                    <BookImage book={book} />
                    <p className="font-medium">{book.titulo}</p>
                    <p className="flex items-center gap-1">
                      {book.avaliacao_geral ?? "0.0"}
                      <Star className="inline-block" size={16} />
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
