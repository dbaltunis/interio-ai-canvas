import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectData = (projectId?: string) => {
  return useQuery({
    queryKey: ['project-data', projectId],
    queryFn: async (): Promise<any> => {
      if (!projectId) return null;

      // Fetch project with client and business settings
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      
      // Fetch business settings for the project owner
      const { data: businessSettings, error: businessError } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', project?.user_id || project?.client?.user_id)
        .single();

      if (businessError && businessError.code !== 'PGRST116') {
        console.warn('No business settings found:', businessError);
      }

      // Fetch related project data - use quotes table instead of non-existent tables
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .eq('project_id', projectId);

      if (quotesError && quotesError.code !== 'PGRST116') throw quotesError;

      // Get actual project treatments/items
      const { data: workshopItems, error: workshopError } = await supabase
        .from('workshop_items')
        .select('*')
        .eq('project_id', projectId);

      if (workshopError && workshopError.code !== 'PGRST116') throw workshopError;
      
      // Get window summaries for more detailed pricing
      const { data: windowSummaries, error: summariesError } = await supabase
        .from('windows_summary')
        .select('*')
        .eq('project_id', projectId);

      if (summariesError && summariesError.code !== 'PGRST116') {
        console.warn('No window summaries found:', summariesError);
      }

      // Calculate totals from real data
      const treatments = workshopItems || [];
      const windowSummaryData = windowSummaries || [];
      
      // Use window summaries for more accurate pricing if available
      const itemsWithPricing = windowSummaryData.length > 0 ? windowSummaryData : treatments;
      
      let subtotal = 0;
      for (const item of itemsWithPricing) {
        subtotal += Number((item as any).total_cost || 0);
      }
      
      // Get tax rate from business settings or default
      const pricingSettings = businessSettings?.pricing_settings as any || {};
      const taxRate = pricingSettings.tax_rate || 0.085;
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;
      
      // Get markup percentage from business settings
      const markupPercentage = pricingSettings.default_markup_percentage || 45;

      return {
        project,
        treatments: treatments || [],
        windowSummaries: windowSummaryData || [],
        rooms: [],
        surfaces: [],
        subtotal,
        taxRate,
        taxAmount,
        total,
        markupPercentage,
        businessSettings: businessSettings || {}
      };
    },
    enabled: !!projectId
  });
};