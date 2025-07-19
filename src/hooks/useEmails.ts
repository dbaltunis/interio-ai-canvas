
import { useQuery } from "@tanstack/react-query";

export interface Email {
  id: string;
  subject: string;
  status: 'sent' | 'scheduled' | 'draft';
  sent_at?: string;
}

export const useEmails = () => {
  return useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      // Mock data for now since emails table doesn't exist
      return [] as Email[];
    },
  });
};
