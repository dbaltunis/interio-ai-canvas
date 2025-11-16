import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  return useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get role from secure user_roles table using SECURITY DEFINER function
      const { data: roleData, error: roleError } = await supabase
        .rpc("get_user_role", { _user_id: user.id });

      if (roleError) {
        console.error("Error fetching user role:", roleError);
      }

      const role = roleData || 'User';

      // Get user profile for parent_account_id
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("parent_account_id")
        .eq("user_id", user.id)
        .single();

      // Use secure server-side function to check admin status
      const { data: isAdminData } = await supabase
        .rpc("is_admin", { _user_id: user.id });

      // Get business settings for cost visibility and markup permissions
      const { data: businessSettings } = await supabase
        .from("business_settings")
        .select("show_vendor_costs_to_managers, show_vendor_costs_to_staff, pricing_settings")
        .eq("user_id", profile?.parent_account_id || user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Determine if user can view vendor costs based on secure role
      const isOwner = role === 'Owner';
      const isManagerOrAdmin = role === 'Manager' || role === 'Admin';
      const isStaff = role === 'Staff' || role === 'User';
      
      let canViewVendorCosts = false;
      if (isOwner || isAdminData) {
        canViewVendorCosts = true; // Owners and Admins always see costs
      } else if (isManagerOrAdmin) {
        canViewVendorCosts = businessSettings?.show_vendor_costs_to_managers || false;
      } else if (isStaff) {
        canViewVendorCosts = businessSettings?.show_vendor_costs_to_staff || false;
      }

      // Determine if user can view markups based on role and settings
      const pricingSettings = businessSettings?.pricing_settings as any;
      const showMarkupToStaff = pricingSettings?.show_markup_to_staff || false;
      
      let canViewMarkup = false;
      if (isOwner || isAdminData) {
        canViewMarkup = true; // Owners and Admins always see markups
      } else if (isManagerOrAdmin) {
        canViewMarkup = true; // Managers can see markups
      } else if (isStaff) {
        canViewMarkup = showMarkupToStaff; // Staff can see if enabled
      }

      // Use secure server-side function to check system owner status
      const { data: isSystemOwnerData } = await supabase
        .rpc("is_system_owner" as any, { _user_id: user.id });

      return {
        role,
        isOwner,
        isSystemOwner: isSystemOwnerData || false, // Use secure function result
        isAdmin: isAdminData || false, // Use secure function result
        isManager: isManagerOrAdmin || isOwner,
        canManageMarkup: isAdminData || false, // Use secure function result
        canViewMarkup,
        canViewVendorCosts,
        parentAccountId: profile?.parent_account_id
      };
    }
  });
};