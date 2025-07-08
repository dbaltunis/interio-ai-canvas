
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface JobStatus {
  id: number;
  name: string;
  color: string;
  category: string;
  action: string;
  description?: string;
}

export const useJobStatuses = () => {
  return useQuery({
    queryKey: ["job-statuses"],
    queryFn: async (): Promise<JobStatus[]> => {
      console.log('Fetching job statuses...');
      // For now, return the default statuses
      // In a real implementation, this would fetch from a database table
      const statuses = [
        { id: 1, name: "Draft", color: "gray", category: "Quote", action: "editable", description: "Initial quote creation" },
        { id: 2, name: "Quote", color: "blue", category: "Quote", action: "editable", description: "Quote ready to send" },
        { id: 3, name: "Sent", color: "yellow", category: "Quote", action: "view_only", description: "Quote sent to client" },
        { id: 4, name: "Order", color: "green", category: "Project", action: "locked", description: "Quote accepted, job locked" },
        { id: 5, name: "In Progress", color: "orange", category: "Project", action: "progress_only", description: "Work in progress" },
        { id: 6, name: "Completed", color: "green", category: "Project", action: "completed", description: "Job completed" },
        { id: 7, name: "Lost Order", color: "red", category: "Quote", action: "requires_reason", description: "Quote lost, reason required" },
      ];
      console.log('Job statuses loaded:', statuses);
      return statuses;
    },
  });
};
