import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WindowSummary {
  window_id: string;
  linear_meters: number;
  widths_required: number;
  price_per_meter: number;
  fabric_cost: number;
  lining_type?: string;
  lining_cost: number;
  manufacturing_type: string;
  manufacturing_cost: number;
  total_cost: number;
  template_id?: string;
  pricing_type: string;
  waste_percent: number;
  currency: string;
  updated_at: string;
}

export const useWindowSummary = (windowId: string | undefined) => {
  return useQuery({
    queryKey: ["window-summary", windowId],
    queryFn: async () => {
      if (!windowId) {
        console.log('useWindowSummary: No windowId provided');
        return null;
      }
      
      console.log('useWindowSummary: Fetching summary for windowId:', windowId);
      
      const { data, error } = await supabase
        .from("windows_summary")
        .select("*")
        .eq("window_id", windowId)
        .maybeSingle();

      console.log('useWindowSummary: Result for', windowId, { data, error });

      if (error) throw error;
      return data as WindowSummary | null;
    },
    enabled: !!windowId,
  });
};

export const useSaveWindowSummary = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (summary: Omit<WindowSummary, "updated_at">) => {
      const { data, error } = await supabase
        .from("windows_summary")
        .upsert(summary)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["window-summary", data.window_id] });
      toast({
        title: "Success",
        description: "Window summary saved successfully",
      });
    },
    onError: (error) => {
      console.error("Save window summary error:", error);
      toast({
        title: "Error",
        description: "Failed to save window summary",
        variant: "destructive",
      });
    },
  });
};