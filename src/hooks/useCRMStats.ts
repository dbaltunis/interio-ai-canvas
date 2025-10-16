import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, startOfQuarter, endOfMonth, endOfQuarter } from "date-fns";

export const useCRMStats = () => {
  return useQuery({
    queryKey: ["crm-stats"],
    queryFn: async () => {
      const now = new Date();
      const monthStart = startOfMonth(now).toISOString();
      const monthEnd = endOfMonth(now).toISOString();
      const quarterStart = startOfQuarter(now).toISOString();
      const quarterEnd = endOfQuarter(now).toISOString();

      // Get all clients
      const { data: allClients, error: clientsError } = await supabase
        .from("clients")
        .select("*, deals(deal_value, stage)");

      if (clientsError) throw clientsError;

      const totalLeads = allClients?.length || 0;
      const activeLeads = allClients?.filter(c => 
        ['lead', 'contacted', 'measuring_scheduled', 'quoted'].includes(c.funnel_stage)
      ).length || 0;
      const convertedLeads = allClients?.filter(c => c.funnel_stage === 'approved').length || 0;

      // Get deals data
      const { data: deals } = await supabase
        .from("deals")
        .select("*");

      const lostDeals = deals?.filter(d => d.stage === 'closed_lost').length || 0;
      
      // Calculate revenue (this month)
      const monthDeals = deals?.filter(d => {
        const createdAt = new Date(d.created_at);
        return createdAt >= new Date(monthStart) && createdAt <= new Date(monthEnd);
      }) || [];

      const totalRevenueThisMonth = monthDeals
        .filter(d => d.stage === 'closed_won')
        .reduce((sum, d) => sum + (d.deal_value || 0), 0);

      const totalRevenueThisQuarter = (deals?.filter(d => {
        const createdAt = new Date(d.created_at);
        return createdAt >= new Date(quarterStart) && createdAt <= new Date(quarterEnd) && d.stage === 'closed_won';
      }) || []).reduce((sum, d) => sum + (d.deal_value || 0), 0);

      // Average deal size
      const closedWonDeals = deals?.filter(d => d.stage === 'closed_won') || [];
      const avgDealSize = closedWonDeals.length > 0
        ? closedWonDeals.reduce((sum, d) => sum + (d.deal_value || 0), 0) / closedWonDeals.length
        : 0;

      // Conversion rate
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      // By source analytics
      const bySource = allClients?.reduce((acc, client) => {
        const source = client.lead_source || 'Unknown';
        if (!acc[source]) {
          acc[source] = { count: 0, converted: 0, totalValue: 0 };
        }
        acc[source].count++;
        if (client.funnel_stage === 'approved') {
          acc[source].converted++;
        }
        acc[source].totalValue += client.deal_value || 0;
        return acc;
      }, {} as Record<string, { count: number; converted: number; totalValue: number }>);

      // By stage analytics
      const byStage = allClients?.reduce((acc, client) => {
        const stage = client.funnel_stage || 'unknown';
        if (!acc[stage]) {
          acc[stage] = { count: 0, totalValue: 0 };
        }
        acc[stage].count++;
        acc[stage].totalValue += client.deal_value || 0;
        return acc;
      }, {} as Record<string, { count: number; totalValue: number }>);

      return {
        totalLeads,
        activeLeads,
        convertedLeads,
        lostDeals,
        totalRevenueThisMonth,
        totalRevenueThisQuarter,
        avgDealSize,
        conversionRate,
        bySource: bySource || {},
        byStage: byStage || {},
      };
    },
  });
};