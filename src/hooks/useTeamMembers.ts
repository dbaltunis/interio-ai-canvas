
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
      console.log('Fetching team members...');
      // For now, return mock data
      // In a real implementation, this would fetch from a database table
      const members = [
        { 
          id: "1", 
          name: "John Smith", 
          email: "john@company.com", 
          role: "Project Manager",
          phone: "+1 (555) 123-4567",
          skills: ["Project Management", "Client Relations"],
          active: true,
          hourly_rate: 85
        },
        { 
          id: "2", 
          name: "Sarah Johnson", 
          email: "sarah@company.com", 
          role: "Designer",
          phone: "+1 (555) 234-5678",
          skills: ["Design", "Color Theory", "CAD"],
          active: true,
          hourly_rate: 75
        },
        { 
          id: "3", 
          name: "Mike Wilson", 
          email: "mike@company.com", 
          role: "Installer",
          phone: "+1 (555) 345-6789",
          skills: ["Installation", "Measurements", "Hardware"],
          active: true,
          hourly_rate: 65
        },
      ];
      console.log('Team members loaded:', members);
      return members;
    },
  });
};
