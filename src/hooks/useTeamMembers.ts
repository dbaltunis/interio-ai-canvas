
import { useQuery } from "@tanstack/react-query";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const useTeamMembers = () => {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: async (): Promise<TeamMember[]> => {
      console.log('Fetching team members...');
      // For now, return mock data
      // In a real implementation, this would fetch from a database table
      const members = [
        { id: "1", name: "John Smith", email: "john@company.com", role: "Project Manager" },
        { id: "2", name: "Sarah Johnson", email: "sarah@company.com", role: "Designer" },
        { id: "3", name: "Mike Wilson", email: "mike@company.com", role: "Installer" },
      ];
      console.log('Team members loaded:', members);
      return members;
    },
  });
};
