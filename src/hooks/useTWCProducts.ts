import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TWCProduct {
  itemNumber: string;
  description: string;
  questions?: TWCQuestion[];
  fabricsAndColours?: {
    itemName?: string;
    itemNumber?: string;
    itemMaterials?: Array<{
      material: string;
      colours: Array<{
        colour: string;
        pricingGroup: string | null;
      }>;
    }>;
  };
}

export interface TWCQuestion {
  question: string;
  questionType: string;
  answers: string[];
}

export interface TWCFabricColor {
  fabricOrColourName: string;
  fabricOrColourCode?: string;
}

export const useTWCProducts = () => {
  return useQuery({
    queryKey: ["twc-products"],
    queryFn: async () => {
      // Verify user is authenticated before making API call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Please log in to access TWC products");
      }

      const { data, error } = await supabase.functions.invoke("twc-get-order-options", {
        body: {}, // Send empty body to fetch all products
      });

      if (error) throw error;
      
      if (!data?.success || !data?.data) {
        throw new Error("Failed to fetch TWC products");
      }

      // The response structure is: { success: true, data: { data: [...] } }
      const productsData = data.data?.data;
      
      if (Array.isArray(productsData)) {
        return productsData as TWCProduct[];
      }
      
      console.warn('Unexpected TWC products data structure:', data);
      return [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1, // Don't retry auth failures multiple times
  });
};

export const useImportTWCProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (selectedProducts: TWCProduct[]) => {
      const { data, error } = await supabase.functions.invoke("twc-sync-products", {
        body: { products: selectedProducts },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["curtain-templates"] });
      
      const summary = [
        `✓ ${data.imported} products imported to Inventory`,
        `✓ ${data.templates_created} templates created in Settings → My Templates`,
        data.options_created > 0 ? `✓ ${data.options_created} options configured` : null,
        data.materials_created > 0 ? `✓ ${data.materials_created} material variants added` : null,
      ].filter(Boolean).join('\n');

      toast.success('TWC Import Complete', {
        description: summary,
        duration: 6000,
      });
    },
    onError: (error) => {
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error('Import Failed', {
        description: `Could not import TWC products: ${errorMessage}`,
        duration: 6000,
      });
    },
  });
};
