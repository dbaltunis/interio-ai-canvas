import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectData = (projectId?: string) => {
  return useQuery({
    queryKey: ['project-data', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      // Fetch project with client
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Fetch related project data - use quotes table instead of non-existent tables
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .eq('project_id', projectId);

      if (quotesError && quotesError.code !== 'PGRST116') throw quotesError;

      // Get workshop data if available
      const { data: workshopItems, error: workshopError } = await supabase
        .from('workshop_items')
        .select('*')
        .eq('project_id', projectId);

      if (workshopError && workshopError.code !== 'PGRST116') throw workshopError;

      // Calculate totals from workshop items or use mock data
      const treatments = workshopItems || [];
      const rooms = [{ id: '1', name: 'Sample Room', project_id: projectId }];
      const surfaces = [{ id: '1', name: 'Sample Window', room_id: '1', project_id: projectId }];
      
      const subtotal = treatments?.reduce((sum: number, t: any) => sum + (t.total_cost || 0), 0) || 200;
      const taxRate = 0.08; // 8% tax rate - should come from business settings
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      return {
        project,
        treatments: treatments || [],
        rooms: rooms || [],
        surfaces: surfaces || [],
        subtotal,
        taxRate,
        taxAmount,
        total,
        markupPercentage: 45 // Should come from business settings
      };
    },
    enabled: !!projectId
  });
};