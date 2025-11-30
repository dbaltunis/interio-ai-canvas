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
      const { data, error } = await supabase.functions.invoke("twc-get-order-options");

      if (error) throw error;
      
      if (!data?.success || !data?.data) {
        throw new Error("Failed to fetch TWC products");
      }

      return data.data as TWCProduct[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
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
