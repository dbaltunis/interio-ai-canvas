import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TWCProduct {
  itemNumber: string;
  itemName: string;
  productType: string;
  questions?: TWCQuestion[];
  fabricsAndColours?: TWCFabricColor[];
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

      // Log the raw response to understand the structure
      console.log('TWC API Response:', data);
      console.log('TWC data.data type:', typeof data.data);
      console.log('TWC data.data:', data.data);
      
      // Handle the data structure - could be array or object
      const productsData = data.data;
      
      // If it's already an array, return it
      if (Array.isArray(productsData)) {
        console.log('Products data is array, length:', productsData.length);
        return productsData as TWCProduct[];
      }
      
      // If it's an object with products array, extract it
      if (productsData && typeof productsData === 'object' && Array.isArray((productsData as any).products)) {
        console.log('Products data has products array, length:', (productsData as any).products.length);
        return (productsData as any).products as TWCProduct[];
      }
      
      // Try to find any array property in the response
      if (productsData && typeof productsData === 'object') {
        const keys = Object.keys(productsData);
        console.log('Available keys in productsData:', keys);
        
        for (const key of keys) {
          if (Array.isArray((productsData as any)[key])) {
            console.log(`Found array at key "${key}", length:`, (productsData as any)[key].length);
            return (productsData as any)[key] as TWCProduct[];
          }
        }
      }
      
      // If we got here, return empty array to prevent crashes
      console.warn('Unexpected TWC products data structure:', productsData);
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
      toast.success(`Successfully imported ${data.imported} TWC products`);
    },
    onError: (error) => {
      toast.error(`Failed to import products: ${error.message}`);
    },
  });
};
