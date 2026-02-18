import { redirect } from "react-router-dom";

export function protectedLoader() {
  const isAuthenticated = false; // pegar de cookie, token, etc

  if (!isAuthenticated) {
    return redirect("/login");
  }

  return null;
}
