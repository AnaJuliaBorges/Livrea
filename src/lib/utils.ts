import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// supabase.rpc() erros (sem .throwOnError()) chegam como objeto plano
// { message, details, hint, code } vindo de JSON.parse, não uma instância
// de Error — `err instanceof Error` sempre dá false e engole a mensagem.
export function getErrorMessage(error: unknown): string | null {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message
  ) {
    return error.message
  }

  return null
}
