import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useFollowers, useFollowing, useUnfollow } from "../hooks/useFollow";
import { UserRoundMinus } from "lucide-react";

type Variant = "followers" | "following";

// Lista de seguidores ("followers") ou de quem o perfil segue ("following").
// No modo "following" do próprio perfil (canUnfollow), cada linha permite
// deixar de seguir. Cada item leva ao perfil da pessoa.
export function FollowListModal({
  userId,
  variant,
  canUnfollow = false,
  onClose,
}: {
  userId: string;
  variant: Variant;
  canUnfollow?: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const followers = useFollowers(userId, variant === "followers");
  const following = useFollowing(userId, variant === "following");
  const unfollow = useUnfollow(userId);

  const { data: users, isLoading } =
    variant === "followers" ? followers : following;

  const title = variant === "followers" ? "Seguidores" : "Seguindo";
  const emptyText =
    variant === "followers"
      ? "Nenhum seguidor ainda."
      : "Não está seguindo ninguém ainda.";

  const openProfile = (id: string) => {
    onClose();
    navigate(`/perfil/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 flex max-h-[80vh] w-full max-w-sm flex-col gap-4 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-medium">{title}</h2>

        <div className="flex flex-col gap-2 overflow-y-auto">
          {isLoading && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Carregando...
            </p>
          )}

          {!isLoading && (users ?? []).length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {emptyText}
            </p>
          )}

          {(users ?? []).map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
            >
              <button
                type="button"
                onClick={() => openProfile(user.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <UserAvatar
                  name={user.name}
                  src={user.avatarUrl}
                  className="h-10 w-10"
                  fallbackClassName="text-xs"
                />
                <p className="truncate text-sm font-medium">{user.name}</p>
              </button>

              {canUnfollow && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs text-secondary"
                  disabled={unfollow.isPending}
                  onClick={() => unfollow.mutate(user.id)}
                >
                  <UserRoundMinus />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="link" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
