import { supabase } from "@/lib/supabase";

export interface ClubMessage {
  id: string;
  content: string;
  isSpoiler: boolean;
  createdAt: string;
  isMine: boolean;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isAdmin: boolean;
  };
}

type RawClubMessage = {
  id: string;
  content: string;
  is_spoiler: boolean;
  created_at: string;
  is_mine: boolean;
  author: {
    id: string;
    name: string;
    avatar_url: string | null;
    is_admin: boolean;
  };
};

// Últimas mensagens em ordem cronológica; a RPC devolve [] pra não-membro.
export async function getClubMessages(clubId: string): Promise<ClubMessage[]> {
  const { data, error } = await supabase.rpc("get_club_messages", {
    p_club_id: clubId,
  });

  if (error) throw error;

  return ((data ?? []) as RawClubMessage[]).map((message) => ({
    id: message.id,
    content: message.content,
    isSpoiler: message.is_spoiler,
    createdAt: message.created_at,
    isMine: message.is_mine,
    author: {
      id: message.author.id,
      name: message.author.name,
      avatarUrl: message.author.avatar_url,
      isAdmin: message.author.is_admin,
    },
  }));
}

export async function sendClubMessage(
  clubId: string,
  content: string,
  isSpoiler: boolean,
): Promise<void> {
  const { error } = await supabase.rpc("send_club_message", {
    p_club_id: clubId,
    p_content: content,
    p_is_spoiler: isSpoiler,
  });

  if (error) throw error;
}
