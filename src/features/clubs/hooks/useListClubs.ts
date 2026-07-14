import { useQuery } from "@tanstack/react-query";
import type { ClubListItem } from "../dtos";
import { listClubs, type ListClubsOptions } from "../services/listClubs";

export function useListClubs(options: ListClubsOptions = {}) {
  return useQuery<ClubListItem[]>({
    queryKey: [
      "clubs",
      {
        onlyMine: options.onlyMine ?? false,
        cityId: options.cityId ?? null,
        stateId: options.stateId ?? null,
      },
    ],
    queryFn: () => listClubs(options),
  });
}
