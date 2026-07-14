import { ContainerBorder } from "@/components/ContainerBorder";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClubMembers } from "../hooks/useClubMembers";

interface Props {
  clubId: string;
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function MembersSection({ clubId }: Props) {
  const { data: members, isLoading, isError } = useClubMembers(clubId);

  if (isLoading) {
    return (
      <p className="text-center text-sm text-muted-foreground mb-8">
        Carregando participantes...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-sm text-red-600 mb-8">
        Não foi possível carregar os participantes.
      </p>
    );
  }

  if (!members || members.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground mb-8">
        Este clube ainda não tem participantes.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 mb-8">
      {members.map((member) => (
        <ContainerBorder
          key={member.id}
          className="flex-row justify-between items-center"
        >
          <div className="flex gap-2 items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={member.avatarUrl ?? undefined}
                alt={member.name}
                className="object-cover"
              />
              <AvatarFallback className="text-xs">
                {initialsOf(member.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{member.name}</p>
              {member.isAdmin && (
                <p className="text-[10px] text-primary">Administrador</p>
              )}
            </div>
          </div>
        </ContainerBorder>
      ))}
    </div>
  );
}
