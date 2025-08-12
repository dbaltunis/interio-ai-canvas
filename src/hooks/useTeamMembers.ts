
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  skills?: string[];
  active?: boolean;
  hourly_rate?: number;
  avatar_url?: string;
}

export const useTeamMembers = () => {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: async (): Promise<TeamMember[]> => {
      // Get current user to resolve account scope and email visibility
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Fetch all profiles in the same account (RLS should scope appropriately)
      const { data: profiles, error } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, role, is_active, phone_number, avatar_url, created_at, parent_account_id")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!profiles) return [];

// Map to TeamMember shape
return profiles
  .filter((p) => !!p.user_id && !!p.display_name)
  .map((p) => ({
    id: p.user_id,
    name: p.display_name,
    email: p.user_id === user.id ? (user.email ?? "") : "Hidden",
    role: p.role || "Staff",
    phone: (p as any).phone_number || undefined,
    active: p.is_active,
    avatar_url: (p as any).avatar_url || undefined,
  }));
    },
  });
};