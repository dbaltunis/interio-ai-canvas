import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type JobStatus = Tables<"job_statuses">;

/**
 * Get status by ID
 */
export const getStatusById = async (statusId: string): Promise<JobStatus | null> => {
  const { data, error } = await supabase
    .from("job_statuses")
    .select("*")
    .eq("id", statusId)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching status:", error);
    return null;
  }

  return data;
};

/**
 * Get the user's default status
 */
export const getDefaultStatus = async (userId: string): Promise<JobStatus | null> => {
  const { data, error } = await supabase
    .from("job_statuses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching default status:", error);
    return null;
  }

  return data;
};

/**
 * Get all active statuses for a user, optionally filtered by category
 */
export const getActiveStatuses = async (
  userId: string,
  category?: "Quote" | "Project"
): Promise<JobStatus[]> => {
  let query = supabase
    .from("job_statuses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("slot_number", { ascending: true });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching active statuses:", error);
    return [];
  }

  return data || [];
};

/**
 * Resolve status display - handles null/invalid status IDs gracefully
 */
export const resolveStatusDisplay = async (
  statusId: string | null
): Promise<{ name: string; color: string; isValid: boolean }> => {
  if (!statusId) {
    return {
      name: "No Status",
      color: "gray",
      isValid: false,
    };
  }

  const status = await getStatusById(statusId);

  if (!status) {
    return {
      name: "Invalid Status",
      color: "red",
      isValid: false,
    };
  }

  return {
    name: status.name,
    color: status.color,
    isValid: true,
  };
};