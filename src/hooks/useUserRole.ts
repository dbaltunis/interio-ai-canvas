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

      // Get business settings for cost visibility permissions
      const { data: businessSettings } = await supabase
        .from("business_settings")
        .select("show_vendor_costs_to_managers, show_vendor_costs_to_staff")
        .eq("user_id", profile?.parent_account_id || user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Determine if user can view vendor costs
      const isOwner = profile?.role === 'Owner';
      const isManagerOrAdmin = profile?.role === 'Manager' || profile?.role === 'Admin';
      const isStaff = profile?.role === 'Staff' || profile?.role === 'User';
      
      let canViewVendorCosts = false;
      if (isOwner || isAdminData) {
        canViewVendorCosts = true; // Owners and Admins always see costs
      } else if (isManagerOrAdmin) {
        canViewVendorCosts = businessSettings?.show_vendor_costs_to_managers || false;
      } else if (isStaff) {
        canViewVendorCosts = businessSettings?.show_vendor_costs_to_staff || false;
      }

      return {
        role: profile?.role || 'User',
        isOwner,
        isAdmin: isAdminData || false, // Use secure function result
        isManager: isManagerOrAdmin || isOwner,
        canManageMarkup: isAdminData || false, // Use secure function result
        canViewMarkup: isOwner || profile?.role === 'Admin' || profile?.role === 'Manager',
        canViewVendorCosts,
        parentAccountId: profile?.parent_account_id
      };
    }
  });
};