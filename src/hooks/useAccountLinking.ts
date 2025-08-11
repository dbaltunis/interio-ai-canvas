
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper to ensure a user is linked to the current admin/owner account.
 * Seeds default permissions if the user doesn't have any yet.
 */
export const linkUserToAccount = async (childUserId: string, parentUserId?: string) => {
  if (!childUserId) return { success: false };

  // Cast to any to allow calling an RPC that might not be in the generated types yet.
  // @ts-ignore
  try {
    const { data, error } = await (supabase as any).rpc('link_user_to_account', {
      child_user_id: childUserId,
      parent_user_id: parentUserId ?? null,
    });
    if (error) throw error;
    return data ?? { success: true };
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes('does not exist') || (msg.includes('function') && msg.includes('link_user_to_account'))) {
      console.warn('link_user_to_account not available yet; skipping link for now.');
      return { success: true };
    }
    console.error('link_user_to_account RPC error:', err);
    throw err;
  }
};
