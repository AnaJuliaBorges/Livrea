import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useAuthRedirect(redirectIfLogged = "/home") {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        navigate(redirectIfLogged);
      }
    });
  }, [navigate, redirectIfLogged]);
}
