import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "../services/getMyProfile";

export function useMyProfile(enabled = true) {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    enabled,
  });
}
