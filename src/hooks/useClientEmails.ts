
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Email } from "./useEmails";

export const useClientEmails = (clientId: string) => {
  return useQuery({
    queryKey: ["client-emails", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Email[];
    },
    enabled: !!clientId,
  });
};
