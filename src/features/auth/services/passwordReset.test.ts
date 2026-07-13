import { describe, it, expect, vi, beforeEach } from "vitest";
import { requestPasswordReset, updatePassword } from "./passwordReset";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

const resetMock = vi.mocked(supabase.auth.resetPasswordForEmail);
const updateUserMock = vi.mocked(supabase.auth.updateUser);

describe("requestPasswordReset", () => {
  beforeEach(() => {
    resetMock.mockReset();
    resetMock.mockResolvedValue({ data: {}, error: null });
  });

  it("solicita o email de recuperação com redirect para /redefinir-senha", async () => {
    await requestPasswordReset("ana@example.com");

    expect(resetMock).toHaveBeenCalledWith("ana@example.com", {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
  });

  it("lança o erro retornado pelo Supabase", async () => {
    resetMock.mockResolvedValue({
      data: null,
      error: new Error("rate limit"),
    } as unknown as Awaited<
      ReturnType<typeof supabase.auth.resetPasswordForEmail>
    >);

    await expect(requestPasswordReset("ana@example.com")).rejects.toThrow(
      "rate limit",
    );
  });
});

describe("updatePassword", () => {
  beforeEach(() => {
    updateUserMock.mockReset();
    updateUserMock.mockResolvedValue({
      data: { user: {} },
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabase.auth.updateUser>>);
  });

  it("atualiza a senha do usuário da sessão", async () => {
    await updatePassword("nova-senha-123");

    expect(updateUserMock).toHaveBeenCalledWith({
      password: "nova-senha-123",
    });
  });

  it("lança o erro retornado pelo Supabase", async () => {
    updateUserMock.mockResolvedValue({
      data: { user: null },
      error: new Error("Auth session missing!"),
    } as unknown as Awaited<ReturnType<typeof supabase.auth.updateUser>>);

    await expect(updatePassword("nova-senha-123")).rejects.toThrow(
      "Auth session missing!",
    );
  });
});
