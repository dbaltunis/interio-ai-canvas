import { WorkroomProductsList } from "@/components/workroom/WorkroomProductsList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WorkroomTabProps {
  projectId: string;
}

export const WorkroomTab = ({ projectId }: WorkroomTabProps) => {
  // Fetch workshop items
  const { data: workshopItems, isLoading } = useQuery({
    queryKey: ["workshop-items", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("workshop_items")
        .select("*")
        .eq("project_id", projectId);
      if (error) {
        console.error('Error fetching workshop items:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <WorkroomProductsList 
      projectId={projectId} 
      workshopItems={workshopItems} 
    />
  );
};
