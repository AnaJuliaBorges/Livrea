import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserBookStatus, setUserBookStatus } from "./userBookStatus";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

const getUserMock = vi.mocked(supabase.auth.getUser);
const fromMock = vi.mocked(supabase.from);

const maybeSingleMock = vi.fn();
const selectEqBookMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
const selectEqUserMock = vi.fn(() => ({ eq: selectEqBookMock }));
const selectMock = vi.fn(() => ({ eq: selectEqUserMock }));

const deleteEqBookMock = vi.fn();
const deleteEqUserMock = vi.fn(() => ({ eq: deleteEqBookMock }));
const deleteMock = vi.fn(() => ({ eq: deleteEqUserMock }));

const upsertMock = vi.fn();

function mockLoggedUser(userId: string | null) {
  getUserMock.mockResolvedValue({
    data: { user: userId ? { id: userId } : null },
    error: null,
  } as unknown as Awaited<ReturnType<typeof supabase.auth.getUser>>);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockLoggedUser("user-1");
  fromMock.mockReturnValue({
    select: selectMock,
    delete: deleteMock,
    upsert: upsertMock,
  } as unknown as ReturnType<typeof supabase.from>);
  maybeSingleMock.mockResolvedValue({ data: null, error: null });
  deleteEqBookMock.mockResolvedValue({ error: null });
  upsertMock.mockResolvedValue({ error: null });
});

describe("getUserBookStatus", () => {
  it("retorna o status do usuário para o livro", async () => {
    maybeSingleMock.mockResolvedValue({
      data: { status: "reading" },
      error: null,
    });

    const status = await getUserBookStatus("book-1");

    expect(fromMock).toHaveBeenCalledWith("user_library");
    expect(selectEqUserMock).toHaveBeenCalledWith("user_id", "user-1");
    expect(selectEqBookMock).toHaveBeenCalledWith("book_id", "book-1");
    expect(status).toBe("reading");
  });

  it("retorna null quando o livro não está na biblioteca", async () => {
    const status = await getUserBookStatus("book-1");

    expect(status).toBeNull();
  });

  it("lança erro quando não há usuário logado", async () => {
    mockLoggedUser(null);

    await expect(getUserBookStatus("book-1")).rejects.toThrow(
      "Usuário não autenticado",
    );
  });
});

describe("setUserBookStatus", () => {
  it("faz upsert do status com a chave user/book", async () => {
    await setUserBookStatus("book-1", "read");

    expect(upsertMock).toHaveBeenCalledWith(
      { user_id: "user-1", book_id: "book-1", status: "read" },
      { onConflict: "user_id,book_id" },
    );
  });

  it("remove a linha quando o status é null", async () => {
    await setUserBookStatus("book-1", null);

    expect(deleteMock).toHaveBeenCalled();
    expect(deleteEqUserMock).toHaveBeenCalledWith("user_id", "user-1");
    expect(deleteEqBookMock).toHaveBeenCalledWith("book_id", "book-1");
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("lança o erro retornado pelo upsert", async () => {
    upsertMock.mockResolvedValue({ error: new Error("RLS negou") });

    await expect(setUserBookStatus("book-1", "read")).rejects.toThrow(
      "RLS negou",
    );
  });
});
