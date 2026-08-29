import { supabase } from "@/lib/supabase";

export type UserBookStatus = "read" | "reading" | "want_to_read";

export async function requireUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");
  return user.id;
}

export async function getUserBookStatus(
  bookId: string,
): Promise<UserBookStatus | null> {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("user_library")
    .select("status")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();

  if (error) throw error;
  return (data?.status as UserBookStatus) ?? null;
}

export async function setUserBookStatus(
  bookId: string,
  status: UserBookStatus | null,
) {
  const userId = await requireUserId();

  if (status === null) {
    const { error } = await supabase
      .from("user_library")
      .delete()
      .eq("user_id", userId)
      .eq("book_id", bookId);

    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("user_library")
    .upsert(
      { user_id: userId, book_id: bookId, status },
      { onConflict: "user_id,book_id" },
    );

  if (error) throw error;
}
