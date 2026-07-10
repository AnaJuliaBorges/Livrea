import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "../services/updateProfile";

export function useUpdateProfile() {
  return useMutation({
    mutationFn: updateProfile,
  });
}
