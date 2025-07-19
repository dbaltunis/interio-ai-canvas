
import { useQuery } from "@tanstack/react-query";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      // Mock data for now since notifications table doesn't exist
      return [] as Notification[];
    },
  });
};
