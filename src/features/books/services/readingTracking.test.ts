import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  deleteHighlight,
  deleteReadingLog,
  deleteReview,
  getReadingTracking,
  saveReadingProgress,
  saveHighlight,
  saveReview,
  updateHighlight,
} from "./readingTracking";
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

const librarySelect = {
  maybeSingle: vi.fn(),
};
const libraryTable = {
  select: vi.fn(() => ({
    eq: vi.fn(() => ({ eq: vi.fn(() => librarySelect) })),
  })),
  upsert: vi.fn(),
  update: vi.fn(() => ({
    eq: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
  })),
};

const logsOrder = vi.fn();
const logsDeleteEqUser = vi.fn();
const logsTable = {
  select: vi.fn(() => ({
    eq: vi.fn(() => ({ eq: vi.fn(() => ({ order: logsOrder })) })),
  })),
  insert: vi.fn(),
  delete: vi.fn(() => ({
    eq: vi.fn(() => ({ eq: logsDeleteEqUser })),
  })),
};

const highlightsOrder = vi.fn();
const highlightsUpdateEqUser = vi.fn();
const highlightsUpdateEqId = vi.fn(() => ({ eq: highlightsUpdateEqUser }));
const highlightsDeleteEqUser = vi.fn();
const highlightsTable = {
  select: vi.fn(() => ({
    eq: vi.fn(() => ({ eq: vi.fn(() => ({ order: highlightsOrder })) })),
  })),
  insert: vi.fn(),
  update: vi.fn(() => ({ eq: highlightsUpdateEqId })),
  delete: vi.fn(() => ({
    eq: vi.fn(() => ({ eq: highlightsDeleteEqUser })),
  })),
};

beforeEach(() => {
  vi.clearAllMocks();

  getUserMock.mockResolvedValue({
    data: { user: { id: "user-1" } },
    error: null,
  } as unknown as Awaited<ReturnType<typeof supabase.auth.getUser>>);

  fromMock.mockImplementation(
    ((table: string) =>
      ({
        user_library: libraryTable,
        reading_logs: logsTable,
        book_highlights: highlightsTable,
      })[table]) as unknown as typeof supabase.from,
  );

  librarySelect.maybeSingle.mockResolvedValue({
    data: { current_page: 120, rating: 4.5, review: "Ótimo" },
    error: null,
  });
  logsOrder.mockResolvedValue({
    data: [
      { id: "log-1", pages_read: 120, feeling: "amei", created_at: "2026-07-10" },
    ],
    error: null,
  });
  highlightsOrder.mockResolvedValue({
    data: [{ id: "hl-1", page: 42, quote: "Frase" }],
    error: null,
  });
  libraryTable.upsert.mockResolvedValue({ error: null });
  logsTable.insert.mockResolvedValue({ error: null });
  highlightsTable.insert.mockResolvedValue({ error: null });
  highlightsUpdateEqUser.mockResolvedValue({ error: null });
});

describe("getReadingTracking", () => {
  it("agrega progresso, logs e destaques do usuário", async () => {
    const tracking = await getReadingTracking("book-1");

    expect(tracking).toEqual({
      currentPage: 120,
      rating: 4.5,
      review: "Ótimo",
      logs: [
        {
          id: "log-1",
          pages_read: 120,
          feeling: "amei",
          created_at: "2026-07-10",
        },
      ],
      highlights: [{ id: "hl-1", page: 42, quote: "Frase" }],
    });
  });

  it("retorna defaults quando o livro não está na biblioteca", async () => {
    librarySelect.maybeSingle.mockResolvedValue({ data: null, error: null });
    logsOrder.mockResolvedValue({ data: null, error: null });
    highlightsOrder.mockResolvedValue({ data: null, error: null });

    const tracking = await getReadingTracking("book-1");

    expect(tracking).toEqual({
      currentPage: 0,
      rating: null,
      review: null,
      logs: [],
      highlights: [],
    });
  });

  it("lança o erro da consulta à user_library", async () => {
    librarySelect.maybeSingle.mockResolvedValue({
      data: null,
      error: new Error("falha na library"),
    });

    await expect(getReadingTracking("book-1")).rejects.toThrow(
      "falha na library",
    );
  });

  it("lança o erro da consulta aos logs de leitura", async () => {
    logsOrder.mockResolvedValue({
      data: null,
      error: new Error("falha nos logs"),
    });

    await expect(getReadingTracking("book-1")).rejects.toThrow(
      "falha nos logs",
    );
  });

  it("lança o erro da consulta aos destaques", async () => {
    highlightsOrder.mockResolvedValue({
      data: null,
      error: new Error("falha nos destaques"),
    });

    await expect(getReadingTracking("book-1")).rejects.toThrow(
      "falha nos destaques",
    );
  });
});

describe("saveReadingProgress", () => {
  it("garante a linha na biblioteca sem sobrescrever status, atualiza o progresso e insere o log", async () => {
    await saveReadingProgress("book-1", 150, "gostei");

    expect(libraryTable.upsert).toHaveBeenCalledWith(
      { user_id: "user-1", book_id: "book-1", status: "reading" },
      { onConflict: "user_id,book_id", ignoreDuplicates: true },
    );
    expect(libraryTable.update).toHaveBeenCalledWith({ current_page: 150 });
    expect(logsTable.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      book_id: "book-1",
      pages_read: 150,
      feeling: "gostei",
      note: null,
    });
  });

  it("salva a anotação aparada; texto só de espaços vira null", async () => {
    await saveReadingProgress("book-1", 150, "gostei", "  achei tenso!  ");

    expect(logsTable.insert).toHaveBeenCalledWith(
      expect.objectContaining({ note: "achei tenso!" }),
    );

    await saveReadingProgress("book-1", 160, "ok", "   ");

    expect(logsTable.insert).toHaveBeenLastCalledWith(
      expect.objectContaining({ note: null }),
    );
  });

  it("lança o erro do insert do log", async () => {
    logsTable.insert.mockResolvedValue({ error: new Error("RLS negou") });

    await expect(saveReadingProgress("book-1", 150, "ok")).rejects.toThrow(
      "RLS negou",
    );
  });

  it("lança o erro do upsert que garante a linha na biblioteca", async () => {
    libraryTable.upsert.mockResolvedValue({
      error: new Error("upsert negado"),
    });

    await expect(saveReadingProgress("book-1", 150, "ok")).rejects.toThrow(
      "upsert negado",
    );
  });

  it("lança o erro do update do progresso", async () => {
    libraryTable.update.mockReturnValueOnce({
      eq: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: new Error("update negado") }),
      })),
    });

    await expect(saveReadingProgress("book-1", 150, "ok")).rejects.toThrow(
      "update negado",
    );
  });
});

describe("saveHighlight", () => {
  it("insere o destaque do usuário", async () => {
    await saveHighlight("book-1", 42, "Uma frase marcante");

    expect(highlightsTable.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      book_id: "book-1",
      page: 42,
      quote: "Uma frase marcante",
    });
  });

  it("lança o erro do insert do destaque", async () => {
    highlightsTable.insert.mockResolvedValue({
      error: new Error("RLS negou"),
    });

    await expect(
      saveHighlight("book-1", 42, "Uma frase marcante"),
    ).rejects.toThrow("RLS negou");
  });
});

describe("updateHighlight", () => {
  it("atualiza citação e página do destaque do próprio usuário", async () => {
    await updateHighlight("hl-1", 50, "Frase corrigida");

    expect(highlightsTable.update).toHaveBeenCalledWith({
      page: 50,
      quote: "Frase corrigida",
    });
    expect(highlightsUpdateEqId).toHaveBeenCalledWith("id", "hl-1");
    expect(highlightsUpdateEqUser).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("lança o erro retornado pelo update", async () => {
    highlightsUpdateEqUser.mockResolvedValue({
      error: new Error("RLS negou"),
    });

    await expect(updateHighlight("hl-1", 50, "Frase")).rejects.toThrow(
      "RLS negou",
    );
  });
});

describe("saveReview", () => {
  it("grava nota e resenha na user_library", async () => {
    await saveReview("book-1", 5, "Recomendo!");

    expect(libraryTable.update).toHaveBeenCalledWith({
      rating: 5,
      review: "Recomendo!",
    });
  });

  it("lança o erro retornado pelo update", async () => {
    libraryTable.update.mockReturnValueOnce({
      eq: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: new Error("RLS negou") }),
      })),
    });

    await expect(saveReview("book-1", 5, "Recomendo!")).rejects.toThrow(
      "RLS negou",
    );
  });
});

describe("deleteReadingLog", () => {
  function mockRemainingLogs(data: { pages_read: number }[]) {
    logsTable.select.mockReturnValueOnce({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data, error: null }),
          })),
        })),
      })),
    } as unknown as ReturnType<typeof logsTable.select>);
  }

  it("apaga o registro e recua current_page pro maior progresso restante", async () => {
    logsDeleteEqUser.mockResolvedValue({ error: null });
    mockRemainingLogs([{ pages_read: 80 }]);

    await deleteReadingLog("book-1", "log-1");

    expect(logsTable.delete).toHaveBeenCalled();
    expect(libraryTable.update).toHaveBeenCalledWith({ current_page: 80 });
  });

  it("zera current_page quando era o único registro", async () => {
    logsDeleteEqUser.mockResolvedValue({ error: null });
    mockRemainingLogs([]);

    await deleteReadingLog("book-1", "log-1");

    expect(libraryTable.update).toHaveBeenCalledWith({ current_page: 0 });
  });

  it("lança o erro do delete sem mexer no progresso", async () => {
    logsDeleteEqUser.mockResolvedValue({ error: new Error("RLS negou") });

    await expect(deleteReadingLog("book-1", "log-1")).rejects.toThrow(
      "RLS negou",
    );
    expect(libraryTable.update).not.toHaveBeenCalled();
  });
});

describe("deleteHighlight", () => {
  it("apaga o destaque do próprio usuário", async () => {
    highlightsDeleteEqUser.mockResolvedValue({ error: null });

    await deleteHighlight("hl-1");

    expect(highlightsTable.delete).toHaveBeenCalled();
  });

  it("lança o erro do delete", async () => {
    highlightsDeleteEqUser.mockResolvedValue({ error: new Error("boom") });

    await expect(deleteHighlight("hl-1")).rejects.toThrow("boom");
  });
});

describe("deleteReview", () => {
  it("zera nota e resenha na user_library", async () => {
    await deleteReview("book-1");

    expect(libraryTable.update).toHaveBeenCalledWith({
      rating: null,
      review: null,
    });
  });
});
