import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  type GoogleProfileFormInput,
  type SecondStepFormData,
  type SignupFormInput,
} from "../model/schema";
import { useSignUpWizardStore } from "../store/useSignUpWizardStore";
import { useSaveProfileGenres } from "@/features/profile";
import { uploadAvatar } from "@/features/profile";
import { useSaveUserBooks } from "@/features/books";
import { useStates, useCities } from "@/hooks/useLocations";
import type { Book } from "@/features/books";

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const data = useSignUpWizardStore((state) => state.data);
  const update = useSignUpWizardStore((state) => state.update);
  const nextStep = useSignUpWizardStore((state) => state.nextStep);
  const { mutateAsync } = useSaveProfileGenres();
  const { mutateAsync: saveBooks } = useSaveUserBooks();

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

      if (authData.user?.id) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            name: data.name,
            bio: data.bio ?? null,
            state_id: data.state_id,
            city_id: data.city_id,
          })
          .eq("id", authData.user.id);

        if (profileError) {
          console.error("Error saving profile details:", profileError);
        }
      }

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
      try {
        await uploadAvatar(userId, avatarFile);
      } catch (err) {
        console.error("Error uploading avatar:", err);
      }
    }

    update("account", { ...data.account, ...formData, user_id: userId! });
    nextStep();
  };

  const submitGoogleStep1 = async (
    formData: GoogleProfileFormInput,
    avatarFile?: File,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const userId = data.account.user_id;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          bio: formData.bio ?? null,
          state_id: formData.state_id,
          city_id: formData.city_id,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      if (avatarFile) {
        try {
          await uploadAvatar(userId, avatarFile);
        } catch (err) {
          console.error("Error uploading avatar:", err);
        }
      }

      update("account", { ...data.account, ...formData });
      nextStep();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
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
    submitGoogleStep1,
    submitStep2,
    submitStep3,
    submitStep4,
  };
}
