import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { type SecondStepFormData, type SignupFormInput } from "../model/schema";
import { useSignUpWizardContext } from "../context/useSignupWizardContext";
import { useSaveProfileGenres } from "@/features/profile/hooks/useSaveProfileGenres";
import type { Book } from "@/features/books/types/book";

interface State {
  id: number;
  name: string;
  sigla: string;
}

interface City {
  id: number;
  name: string;
  state_id: number;
}

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, update, nextStep } = useSignUpWizardContext();
  const { mutateAsync } = useSaveProfileGenres();

  async function getStates(): Promise<State[]> {
    const { data, error } = await supabase
      .from("states")
      .select("id, name, sigla")
      .order("name");

    if (error) throw error;
    return data ?? [];
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

      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      return authData;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitStep1 = async (formData: SignupFormInput) => {
    const authData = await handleSignupFirstStep(formData);
    const userId = authData.user?.id;

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
      read: selectedBooks,
    });

    console.log(data);
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
