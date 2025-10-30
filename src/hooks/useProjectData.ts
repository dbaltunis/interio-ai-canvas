import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectData {
  project: any;
  treatments: any[];
  items?: any[]; // Added for quote display
  windowSummaries: any[];
  rooms: any[];
  surfaces: any[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  markupPercentage: number;
  businessSettings: any;
}

export const useProjectData = (projectId?: string) => {
  return useQuery<ProjectData | null>({
    queryKey: ['project-data', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      try {
        // Fetch project with client
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select(`
            *,
            client:clients(*)
          `)
          .eq('id', projectId)
          .maybeSingle();

        if (projectError) {
          console.error('Project fetch error:', projectError);
          throw projectError;
        }

        if (!project) {
          console.warn('No project found for ID:', projectId);
          return null;
        }
        
        // Fetch business settings for the project owner
        const { data: businessSettings, error: businessError } = await supabase
          .from('business_settings')
          .select('*')
          .eq('user_id', project.user_id || project.client?.user_id)
          .maybeSingle();

        if (businessError && businessError.code !== 'PGRST116') {
          console.warn('Business settings fetch error:', businessError);
        }

        // Fetch related project data
        const { data: quotes, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .eq('project_id', projectId);

        if (quotesError && quotesError.code !== 'PGRST116') {
          console.warn('Quotes fetch error:', quotesError);
        }

        // Get actual project treatments/items
        const { data: workshopItems, error: workshopError } = await supabase
          .from('workshop_items')
          .select('*')
          .eq('project_id', projectId);

        if (workshopError && workshopError.code !== 'PGRST116') {
          console.warn('Workshop items fetch error:', workshopError);
        }
        
        // Transform workshop items to include proper pricing fields
        const treatments = (workshopItems || []).map((item: any) => ({
          ...item,
          // Ensure pricing fields are available for quote display
          unit_price: item.total_cost || 0,
          total: item.total_cost || 0,
          quantity: 1,
          // Build breakdown from detailed cost components
          cost_breakdown: {
            fabric_cost: item.fabric_details?.selling_price ? 
              (item.linear_meters || 0) * (item.fabric_details.selling_price || 0) : 0,
            manufacturing_cost: item.manufacturing_details?.cost || 0,
            total: item.total_cost || 0
          }
        }));
        
        const itemsWithPricing = treatments;
        
        let subtotal = 0;
        if (itemsWithPricing && Array.isArray(itemsWithPricing)) {
          for (const item of itemsWithPricing) {
            if (item && typeof item === 'object') {
              const cost = Number((item as any).total_cost || 0);
              subtotal += cost;
            }
          }
        }
        
        // Get tax rate from business settings or default
        let taxRate = 0.085; // Default 8.5%
        let markupPercentage = 45; // Default 45%
        let taxInclusive = false;
        
        if (businessSettings && businessSettings.pricing_settings) {
          const settings = businessSettings.pricing_settings as any;
          if (settings && typeof settings === 'object') {
            taxRate = Number(settings.tax_rate) || 0.085;
            markupPercentage = Number(settings.default_markup_percentage) || 45;
            taxInclusive = settings.tax_inclusive || false;
          }
        }
        
        // Calculate tax based on tax_inclusive setting
        let taxAmount: number;
        let total: number;
        let finalSubtotal: number;
        
        if (taxInclusive) {
          // Prices already include tax
          total = subtotal;
          finalSubtotal = subtotal / (1 + taxRate);
          taxAmount = total - finalSubtotal;
        } else {
          // Prices exclude tax
          finalSubtotal = subtotal;
          taxAmount = subtotal * taxRate;
          total = subtotal + taxAmount;
        }

        return {
          project,
          treatments,
          items: treatments, // Add items field for quote display
          windowSummaries: [],
          rooms: [],
          surfaces: [],
          subtotal: finalSubtotal,
          taxRate,
          taxAmount,
          total,
          markupPercentage,
          businessSettings: businessSettings || {}
        };
      } catch (error) {
        console.error('Error in useProjectData:', error);
        throw error;
      }
    },
    enabled: !!projectId
  });
};