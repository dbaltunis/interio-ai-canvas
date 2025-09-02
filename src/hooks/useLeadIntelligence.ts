import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLeadScoringRules = () => {
  return useQuery({
    queryKey: ["lead-scoring-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_scoring_rules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useClientInteractions = (clientId: string) => {
  return useQuery({
    queryKey: ["client-interactions", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_interactions")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });
};

export const useCreateInteraction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (interaction: {
      client_id: string;
      interaction_type: string;
      interaction_details?: any;
      points_awarded?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("client_interactions")
        .insert({
          ...interaction,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client-interactions", data.client_id] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useHotLeads = () => {
  return useQuery({
    queryKey: ["hot-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .gte("lead_score", 50)
        .order("lead_score", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useLeadSourceAnalytics = () => {
  return useQuery({
    queryKey: ["lead-source-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("lead_source, lead_score, deal_value, funnel_stage")
        .not("lead_source", "is", null);

      if (error) throw error;
      
      // Group by lead source and calculate metrics
      const sourceMetrics = (data || []).reduce((acc, client) => {
        const source = client.lead_source || 'Unknown';
        if (!acc[source]) {
          acc[source] = {
            total_leads: 0,
            avg_score: 0,
            total_value: 0,
            converted: 0,
            scores: []
          };
        }
        
        acc[source].total_leads++;
        acc[source].scores.push(client.lead_score || 0);
        acc[source].total_value += parseFloat(client.deal_value?.toString() || '0');
        
        if (client.funnel_stage === 'approved' || client.funnel_stage === 'completed') {
          acc[source].converted++;
        }
        
        return acc;
      }, {} as Record<string, any>);

      // Calculate averages
      Object.keys(sourceMetrics).forEach(source => {
        const metrics = sourceMetrics[source];
        metrics.avg_score = metrics.scores.reduce((sum: number, score: number) => sum + score, 0) / metrics.scores.length;
        metrics.conversion_rate = (metrics.converted / metrics.total_leads) * 100;
      });

      return Object.entries(sourceMetrics).map(([source, metrics]) => ({
        source,
        ...metrics
      }));
    },
  });
};