
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper to ensure a user is linked to the current admin/owner account.
 * Seeds default permissions if the user doesn't have any yet.
 */
export const linkUserToAccount = async (childUserId: string, parentUserId?: string) => {
  if (!childUserId) return { success: false };

  // Cast to any to allow calling an RPC that isn't present in the generated types yet.
  // @ts-ignore - RPC not present in generated Supabase types yet; safe to ignore until types are regenerated.
  const { data, error } = await (supabase as any).rpc('link_user_to_account', {
    child_user_id: childUserId,
    parent_user_id: parentUserId ?? null,
  });

  if (error) {
    console.error("link_user_to_account RPC error:", error);
    throw error;
  }

  return data ?? { success: true };
};
