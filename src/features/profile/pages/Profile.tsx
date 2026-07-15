import { LocalizationPin } from "@/components/LocalizationPin";
import { BackButton } from "@/components/BackButton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ItemClub from "@/features/clubs/components/ItemClub";
import { Bookmark, BookmarkMinus, BookmarkPlus, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookListCard } from "@/features/books/components/BookListCard";
import { Tag } from "../components/Tag";
import { useMyProfile } from "../hooks/useMyProfile";

export default function Profile() {
  const [tagActive, setTagActive] = useState("read");
  const navigate = useNavigate();
  const { data: profile, isLoading, isError } = useMyProfile();

  if (isLoading) {
    return (
      <p className="mt-20 text-center text-muted-foreground">
        Carregando perfil...
      </p>
    );
  }

  if (isError || !profile) {
    return (
      <p className="mt-20 text-center text-muted-foreground">
        Não foi possível carregar o perfil. Tente novamente.
      </p>
    );
  }

  const qntyReadBooks = profile.library.read.length;
  const qntyClubs = profile.clubs.length;

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  function bookActive() {
    if (!profile) return [];

    switch (tagActive) {
      case "read":
        return profile.library.read;
      case "reading":
        return profile.library.reading;
      case "want-to-read":
        return profile.library.wantToRead;
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
        <BackButton />

        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 ">
          <Avatar className="w-32 h-32 shadow-xl border-2 border-gray-400">
            <AvatarImage
              src={profile.avatarUrl ?? undefined}
              alt={profile.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-gray-300 text-3xl">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium">{profile.name}</h2>
            {profile.city && profile.state && (
              <LocalizationPin
                city={profile.city}
                state={profile.state}
                color="text-foreground"
                size="text-sm"
              />
            )}
          </div>
          <Settings onClick={() => navigate("/perfil/editar")} />
        </div>

        {profile.bio && <p>"{profile.bio}"</p>}

        <div className="grid grid-cols-3 gap-2 my-2">
          {qntyComponent(qntyReadBooks, "livros lidos")}
          {qntyComponent(qntyClubs, "clubes")}
          {/* amizades ainda não existem no schema */}
          {qntyComponent(0, "amigos")}
        </div>

        <Tabs defaultValue="clubs" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="clubs">Meus clubes</TabsTrigger>
            <TabsTrigger value="books">Meus livros</TabsTrigger>
          </TabsList>
          <TabsContent value="clubs">
            <div className="mb-6 mt-6">
              {profile.clubs.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  Você ainda não participa de nenhum clube.
                </p>
              )}
              {profile.clubs.map((club) => (
                <div key={club.id}>
                  <ItemClub club={club} admin={club.isAdmin} />
                  <Separator className="my-4" />
                </div>
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
              {bookActive().length === 0 && (
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Nenhum livro nesta lista ainda.
                </p>
              )}
              <div className="grid grid-cols-2 mb-8 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                {bookActive().map((book) => (
                  <BookListCard
                    key={book.id}
                    title={book.title}
                    image={
                      book.imageMedium ||
                      book.imageThumbnail ||
                      book.imageLarge ||
                      undefined
                    }
                    to={`/livros/${book.id}`}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
