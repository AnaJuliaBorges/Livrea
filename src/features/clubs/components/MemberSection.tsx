import { ContainerBorder } from "@/components/ContainerBorder";
import { mockClubParticipants } from "@/mocks/clubes";
import { SquarePlus, UserRound } from "lucide-react";

interface Props {
  clubId: string;
}

export default function MembersSection({ clubId }: Props) {
  return (
    <div className="flex flex-col gap-2 mb-8">
      {mockClubParticipants.map((member) => (
        <ContainerBorder className="flex-row justify-between items-center">
          <div className="flex gap-2">
            <UserRound />
            <div>
              <p className="text-xs font-medium">{member.name}</p>
              <p className="text-[10px] text-gray-500">
                Membro desde {member.joinedAt}
              </p>
            </div>
          </div>
          <SquarePlus className="text-secondary" size={20} />
        </ContainerBorder>
      ))}
    </div>
  );
}
