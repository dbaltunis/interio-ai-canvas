import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClientStats = () => {
  return useQuery({
    queryKey: ["client-stats"],
    queryFn: async () => {
      // RLS handles account-level filtering automatically
      const { data: clients, error } = await supabase
        .from("clients")
        .select(`
          id,
          name,
          company_name,
          funnel_stage,
          projects (
            id,
            name,
            status,
            quotes (
              id,
              total_amount,
              status
            )
          )
        `);

      if (error) throw error;

      // Calculate stats for each client
      const clientStats = clients?.map(client => {
        const projectCount = client.projects?.length || 0;
        
        // Get all quotes from all projects for this client
        const allQuotes = client.projects?.flatMap(project => project.quotes || []) || [];
        
        const quotesData = {
          draft: allQuotes.filter(q => q.status === 'draft').length,
          sent: allQuotes.filter(q => q.status === 'sent').length,
          accepted: allQuotes.filter(q => q.status === 'accepted').length,
          total: allQuotes.length
        };
        
        // Calculate lifetime value from ALL projects (sum of all quote totals)
        const allProjects = client.projects || [];
        const totalValue = allProjects.reduce((sum, project) => {
          const projectQuotes = project.quotes || [];
          if (projectQuotes.length > 0) {
            // Sum all quotes for each project
            const projectTotal = projectQuotes.reduce((qSum, quote) => 
              qSum + parseFloat(quote.total_amount?.toString() || '0'), 0
            );
            return sum + projectTotal;
          }
          return sum;
        }, 0);

        return {
          clientId: client.id,
          name: client.name,
          companyName: client.company_name,
          funnelStage: client.funnel_stage,
          projectCount,
          totalValue,
          quotesData
        };
      }) || [];

      return clientStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClientJobs = (clientId: string) => {
  return useQuery({
    queryKey: ["client-jobs", clientId],
    queryFn: async () => {
      if (!clientId) return [];

      // RLS handles account-level filtering automatically
      const { data: projects, error } = await supabase
        .from("projects")
        .select(`
          *,
          quotes (
            id,
            total_amount,
            status
          )
        `)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return projects || [];
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClientEmails = (clientId: string) => {
  return useQuery({
    queryKey: ["client-emails", clientId],
    queryFn: async () => {
      if (!clientId) return [];

      // RLS handles account-level filtering automatically
      const { data: emails, error } = await supabase
        .from("emails")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return emails || [];
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClientQuotes = (clientId: string) => {
  return useQuery({
    queryKey: ["client-quotes", clientId],
    queryFn: async () => {
      if (!clientId) return [];

      // First, get all projects for this client (RLS handles filtering)
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id")
        .eq("client_id", clientId);

      if (projectsError) throw projectsError;
      if (!projects || projects.length === 0) return [];

      const projectIds = projects.map(p => p.id);

      // Then get quotes for those projects (RLS handles filtering)
      const { data: quotes, error } = await supabase
        .from("quotes")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return quotes || [];
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Calculate total value from all quotes for a client
export const calculateClientDealValue = (quotes: any[]) => {
  if (!quotes || quotes.length === 0) return 0;
  
  return quotes.reduce((sum, quote) => {
    return sum + (parseFloat(quote.total_amount?.toString() || '0'));
  }, 0);
};
