
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClientJobs = (clientId: string) => {
  return useQuery({
    queryKey: ["client-jobs", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });
};

export const useClientStats = () => {
  return useQuery({
    queryKey: ["client-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Get clients with their job counts
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select(`
          *,
          projects:projects(count)
        `)
        .eq("user_id", user.id);

      if (clientsError) throw clientsError;

      // Get email counts for each client
      const { data: emails, error: emailsError } = await supabase
        .from("emails")
        .select("client_id")
        .eq("user_id", user.id);

      if (emailsError) throw emailsError;

      // Calculate email counts per client
      const emailCounts = emails?.reduce((acc: Record<string, number>, email) => {
        if (email.client_id) {
          acc[email.client_id] = (acc[email.client_id] || 0) + 1;
        }
        return acc;
      }, {}) || {};

      // Calculate project values (mock for now - would need actual project values)
      const clientsWithStats = clients?.map(client => ({
        ...client,
        jobCount: client.projects?.[0]?.count || 0,
        emailCount: emailCounts[client.id] || 0,
        totalValue: Math.floor(Math.random() * 50000) + 5000, // Mock value - replace with actual calculation
      }));

      return clientsWithStats || [];
    },
  });
};
