import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  return useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get user profile for role display
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role, parent_account_id")
        .eq("user_id", user.id)
        .single();

      // Use secure server-side function to check admin status
      const { data: isAdminData } = await supabase
        .rpc("is_admin", { _user_id: user.id });

      return {
        role: profile?.role || 'User',
        isOwner: profile?.role === 'Owner',
        isAdmin: isAdminData || false, // Use secure function result
        isManager: profile?.role === 'Manager' || profile?.role === 'Admin' || profile?.role === 'Owner',
        canManageMarkup: isAdminData || false, // Use secure function result
        canViewMarkup: profile?.role === 'Owner' || profile?.role === 'Admin' || profile?.role === 'Manager',
        parentAccountId: profile?.parent_account_id
      };
    }
  });
};