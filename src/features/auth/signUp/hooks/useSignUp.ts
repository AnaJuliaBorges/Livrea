import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { type SecondStepFormData, type SignupFormInput } from "../model/schema";
import { useSignUpWizardStore } from "../store/useSignUpWizardStore";
import { useSaveProfileGenres } from "@/features/profile/hooks/useSaveProfileGenres";
import { uploadAvatar } from "@/features/profile/services/uploadAvatar";
import { useSaveUserBooks } from "@/features/books/hooks/useSaveUserBooks";
import type { Book } from "@/features/books/types/book";

interface State {
  id: number;
  name: string;
  abbreviation: string;
}

interface City {
  id: number;
  name: string;
  state_id: number;
}

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const data = useSignUpWizardStore((state) => state.data);
  const update = useSignUpWizardStore((state) => state.update);
  const nextStep = useSignUpWizardStore((state) => state.nextStep);
  const { mutateAsync } = useSaveProfileGenres();
  const { mutateAsync: saveBooks } = useSaveUserBooks();

  async function getStates(): Promise<State[]> {
    const { data, error } = await supabase
      .from("states")
      .select("id, name, sigla")
      .order("name");

    if (error) throw error;
    return (data ?? []).map((state) => ({
      id: state.id,
      name: state.name,
      abbreviation: state.sigla,
    }));
  }

  function useStates() {
    return useQuery({
      queryKey: ["states"],
      queryFn: getStates,
    });
  }

  async function getCities(stateId: number): Promise<City[]> {
    const { data, error } = await supabase
      .from("cities")
      .select("id, name, state_id")
      .eq("state_id", stateId)
      .order("name");

    if (error) throw error;
    return data ?? [];
  }

  function useCities(stateId?: number) {
    return useQuery({
      queryKey: ["cities", stateId],
      enabled: !!stateId,
      queryFn: () => getCities(stateId!),
    });
  }

  const handleSignupFirstStep = async (data: SignupFormInput) => {
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            bio: data.bio,
            state_id: data.state_id,
            city_id: data.city_id,
          },
        },
      });

      if (error) throw error;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) throw signInError;

      return authData;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitStep1 = async (formData: SignupFormInput, avatarFile?: File) => {
    const authData = await handleSignupFirstStep(formData);
    const userId = authData.user?.id;

    if (avatarFile && userId) {
      // a conta já foi criada; falha no avatar não deve travar o cadastro
      try {
        await uploadAvatar(userId, avatarFile);
      } catch (err) {
        console.error("Error uploading avatar:", err);
      }
    }

    update("account", { ...data.account, ...formData, user_id: userId! });
    nextStep();
  };

  const submitStep2 = async (formData: SecondStepFormData) => {
    const genres = formData.genres.map(Number);

    update("genres", genres);

    await mutateAsync({
      userId: data.account.user_id!,
      genreIds: genres,
    });

    nextStep();
  };

  const submitStep3 = async (selectedBooks: Book[]) => {
    update("books", {
      ...data.books,
      read: selectedBooks,
    });

    nextStep();
  };

  const submitStep4 = async (selectedBooks: Book[]) => {
    update("books", {
      ...data.books,
      wantRead: selectedBooks,
    });

    setLoading(true);
    setError(null);

    try {
      await saveBooks({ books: data.books.read, status: "read" });
      await saveBooks({ books: selectedBooks, status: "want_to_read" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSignupFirstStep,
    useStates,
    useCities,
    loading,
    error,
    submitStep1,
    submitStep2,
    submitStep3,
    submitStep4,
  };
}
