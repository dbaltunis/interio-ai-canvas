import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  return useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role, parent_account_id")
        .eq("user_id", user.id)
        .single();

      return {
        role: profile?.role || 'User',
        isOwner: profile?.role === 'Owner',
        isAdmin: profile?.role === 'Admin' || profile?.role === 'Owner',
        isManager: profile?.role === 'Manager' || profile?.role === 'Admin' || profile?.role === 'Owner',
        canManageMarkup: profile?.role === 'Owner' || profile?.role === 'Admin',
        canViewMarkup: profile?.role === 'Owner' || profile?.role === 'Admin' || profile?.role === 'Manager',
        parentAccountId: profile?.parent_account_id
      };
    }
  });
};