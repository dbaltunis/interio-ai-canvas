
import { useQuery } from "@tanstack/react-query";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  skills?: string[];
  active?: boolean;
  hourly_rate?: number;
}

export const useTeamMembers = () => {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: async (): Promise<TeamMember[]> => {
      console.log('Team functionality temporarily disabled');
      // Team functionality temporarily disabled for stability
      // Return empty array to prevent errors in components that expect this data
      return [];
    },
  });
};
