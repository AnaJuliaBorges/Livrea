import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markAllNotificationsRead,
} from "../services/getNotifications";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
}

// contagem pro badge do sino — deriva da mesma query (cache compartilhado)
export function useUnreadNotificationsCount() {
  const { data } = useNotifications();
  return (data ?? []).filter((notification) => !notification.read).length;
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
