import { describe, it, expect, vi, beforeEach } from "vitest";
import { signInWithGoogle } from "./signInWithGoogle";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(),
    },
  },
}));

const signInWithOAuthMock = vi.mocked(supabase.auth.signInWithOAuth);

describe("signInWithGoogle", () => {
  beforeEach(() => {
    signInWithOAuthMock.mockReset();
    signInWithOAuthMock.mockResolvedValue({
      data: { provider: "google", url: "https://accounts.google.com/..." },
      error: null,
    });
  });

  it("inicia o OAuth do Google com redirect para a rota informada", async () => {
    await signInWithGoogle("/login");

    expect(signInWithOAuthMock).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
  });

  it("lança o erro retornado pelo Supabase", async () => {
    signInWithOAuthMock.mockResolvedValue({
      data: { provider: "google", url: null },
      error: Object.assign(new Error("provider is not enabled"), {
        name: "AuthApiError",
        status: 400,
        code: "validation_failed",
        __isAuthError: true,
      }),
    } as unknown as Awaited<ReturnType<typeof supabase.auth.signInWithOAuth>>);

    await expect(signInWithGoogle("/login")).rejects.toThrow(
      "provider is not enabled",
    );
  });
});
