import { LocalizationPin } from "@/components/shared/LocalizationPin";
import { BackButton } from "@/components/shared/BackButton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ItemClub } from "@/features/clubs";
import {
  Bell,
  Bookmark,
  BookmarkMinus,
  BookmarkPlus,
  Settings,
  SquareMinus,
  SquarePlus,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookListCard } from "@/features/books";
import { FilterChip } from "../components/FilterChip";
import { useMyProfile } from "../hooks/useMyProfile";
import { useUserProfile } from "../hooks/useUserProfile";
import { useUnreadNotificationsCount } from "@/features/notifications";
import {
  useFollowInfo,
  useFollowUser,
  useUnfollowUser,
} from "../hooks/useFollow";
import { useProfileHeaderColor } from "../hooks/useProfileHeaderColor";
import { headerGradient } from "@/lib/headerColors";

export default function Profile() {
  const [tagActive, setTagActive] = useState("read");
  const navigate = useNavigate();
  const { id } = useParams();
  const isOwnProfile = !id;
  const myProfile = useMyProfile(isOwnProfile);
  const otherProfile = useUserProfile(isOwnProfile ? undefined : id);
  const unreadCount = useUnreadNotificationsCount();
  const {
    data: profile,
    isLoading,
    isError,
  } = isOwnProfile ? myProfile : otherProfile;
  const { data: followInfo } = useFollowInfo(profile?.id);
  const { data: headerColor } = useProfileHeaderColor(profile?.id);
  const followMutation = useFollowUser(id);
  const unfollowMutation = useUnfollowUser(id);

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
      <div
        className={`relative left-1/2 -mt-6 h-30 w-screen -translate-x-1/2 md:bg-none ${headerGradient(headerColor)}`}
      >
        <BackButton className="absolute left-4 top-4 z-10 text-gray-300 hover:bg-white/20 md:hidden" />

        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 ">
          <UserAvatar
            name={profile.name}
            src={profile.avatarUrl}
            className="w-32 h-32 shadow-xl border-2 border-gray-400"
            fallbackClassName="bg-gray-300 text-3xl"
          />
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-4 md:mx-auto md:w-full md:max-w-3xl">
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
          {isOwnProfile ? (
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Notificações"
                className="relative"
                onClick={() => navigate("/notificacoes")}
              >
                <Bell />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <Settings onClick={() => navigate("/perfil/editar")} />
            </div>
          ) : (
            <button
              type="button"
              aria-label={
                followInfo?.isFollowing ? "Deixar de seguir" : "Seguir"
              }
              disabled={
                !followInfo ||
                followMutation.isPending ||
                unfollowMutation.isPending
              }
              className="disabled:opacity-50"
              onClick={() =>
                followInfo?.isFollowing
                  ? unfollowMutation.mutate()
                  : followMutation.mutate()
              }
            >
              {followInfo?.isFollowing ? (
                <SquareMinus className="size-5 text-secondary" />
              ) : (
                <SquarePlus className="size-5 text-secondary" />
              )}
            </button>
          )}
        </div>

        {profile.bio && <p>"{profile.bio}"</p>}

        <div className="grid grid-cols-3 gap-2 my-2">
          {qntyComponent(qntyReadBooks, "livros lidos")}
          {qntyComponent(qntyClubs, "clubes")}
          {qntyComponent(followInfo?.followersCount ?? 0, "seguidores")}
        </div>

        <Tabs defaultValue="clubs" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="clubs">
              {isOwnProfile ? "Meus clubes" : "Clubes"}
            </TabsTrigger>
            <TabsTrigger value="books">
              {isOwnProfile ? "Meus livros" : "Livros"}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="clubs">
            <div className="mb-6 mt-6">
              {profile.clubs.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  {isOwnProfile
                    ? "Você ainda não participa de nenhum clube."
                    : "Este usuário ainda não participa de nenhum clube."}
                </p>
              )}
              <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
                {profile.clubs.map((club) => (
                  <div key={club.id}>
                    <ItemClub club={club} admin={club.isAdmin} />
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="books">
            <div className="flex gap-2 mt-6">
              <FilterChip
                label="Lido"
                active={tagActive === "read"}
                icon={<Bookmark className="size-4" />}
                color="bg-success-light"
                onClick={() => setTagActive("read")}
              />
              <FilterChip
                label="Lendo"
                active={tagActive === "reading"}
                icon={<BookmarkMinus className="size-4" />}
                color="bg-warning-light"
                onClick={() => setTagActive("reading")}
              />
              <FilterChip
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
