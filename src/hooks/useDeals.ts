import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDeals = () => {
  return useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select(`
          *,
          clients:client_id (
            id,
            name,
            company_name,
            client_type,
            email,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useDealsByStage = () => {
  return useQuery({
    queryKey: ["deals-by-stage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("stage, deal_value, probability")
        .not("stage", "in", '("closed_won","closed_lost")');

      if (error) throw error;
      
      const stageData = (data || []).reduce((acc, deal) => {
        const stage = deal.stage || 'qualification';
        if (!acc[stage]) {
          acc[stage] = {
            count: 0,
            total_value: 0,
            weighted_value: 0
          };
        }
        acc[stage].count++;
        acc[stage].total_value += parseFloat(deal.deal_value?.toString() || '0');
        acc[stage].weighted_value += (parseFloat(deal.deal_value?.toString() || '0') * (deal.probability || 50)) / 100;
        return acc;
      }, {} as Record<string, any>);

      return stageData;
    },
  });
};

export const useSalesForecast = (period: 'monthly' | 'quarterly' | 'yearly' = 'monthly') => {
  return useQuery({
    queryKey: ["sales-forecast", period],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const periodStart = new Date();
      const periodEnd = new Date();
      
      switch (period) {
        case 'monthly':
          periodStart.setDate(1);
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          periodEnd.setDate(0);
          break;
        case 'quarterly':
          const quarter = Math.floor(periodStart.getMonth() / 3);
          periodStart.setMonth(quarter * 3, 1);
          periodEnd.setMonth((quarter + 1) * 3, 0);
          break;
        case 'yearly':
          periodStart.setMonth(0, 1);
          periodEnd.setFullYear(periodEnd.getFullYear() + 1, 0, 0);
          break;
      }

      const { data, error } = await supabase.rpc('calculate_sales_forecast', {
        user_id_param: user.id,
        period_start_param: periodStart.toISOString().split('T')[0],
        period_end_param: periodEnd.toISOString().split('T')[0]
      });

      if (error) throw error;
      return { forecasted_amount: data || 0, period_start: periodStart, period_end: periodEnd };
    },
  });
};

export const usePipelineAnalytics = () => {
  return useQuery({
    queryKey: ["pipeline-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_analytics")
        .select("*")
        .order("stage");

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (deal: {
      client_id: string;
      title: string;
      description?: string;
      deal_value: number;
      probability?: number;
      stage?: string;
      expected_close_date?: string;
      source?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("deals")
        .insert({
          ...deal,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals-by-stage"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-analytics"] });
      toast({
        title: "Success",
        description: "Deal created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create deal",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateDeal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<any>) => {
      const { data, error } = await supabase
        .from("deals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals-by-stage"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-analytics"] });
      toast({
        title: "Success",
        description: "Deal updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update deal",
        variant: "destructive"
      });
    },
  });
};