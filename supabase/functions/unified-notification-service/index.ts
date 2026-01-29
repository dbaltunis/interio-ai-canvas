import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type?: "info" | "warning" | "error";
  category?: "project" | "appointment" | "quote" | "team" | "system" | "general";
  priority?: "low" | "normal" | "high";
  source_type?: string;
  source_id?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  group_key?: string;
  parent_id?: string;
  expires_at?: string;
}

// Generate action_url based on source_type and source_id
function generateActionUrl(source_type: string | undefined, source_id: string | undefined): string | null {
  if (!source_type || !source_id) return null;

  const urlMap: Record<string, string> = {
    project: `/jobs?project=${source_id}`,
    appointment: `/calendar?appointment=${source_id}`,
    quote: `/quotes/${source_id}`,
    client: `/clients?client=${source_id}`,
    team: `/settings/team`,
    order: `/orders?order=${source_id}`,
  };

  return urlMap[source_type] || null;
}

// Check user preferences to see if they want this notification
async function shouldSendNotification(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  category: string
): Promise<{ send: boolean; channels: { email: boolean; push: boolean; sms: boolean } }> {
  const { data: preferences } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  // Default to sending if no preferences set
  if (!preferences) {
    return {
      send: true,
      channels: { email: true, push: true, sms: false },
    };
  }

  // Check quiet hours
  if (preferences.quiet_hours_enabled && preferences.quiet_hours_start && preferences.quiet_hours_end) {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const start = preferences.quiet_hours_start;
    const end = preferences.quiet_hours_end;

    // Simple quiet hours check (doesn't handle overnight spans)
    if (currentTime >= start && currentTime <= end) {
      console.log(`User ${userId} is in quiet hours, skipping notification`);
      return { send: false, channels: { email: false, push: false, sms: false } };
    }
  }

  // Check category preferences
  const categoryPrefs = preferences.category_preferences as Record<string, boolean> || {};
  if (categoryPrefs[category] === false) {
    console.log(`User ${userId} has disabled ${category} notifications`);
    return { send: false, channels: { email: false, push: false, sms: false } };
  }

  return {
    send: true,
    channels: {
      email: preferences.email_enabled ?? true,
      push: preferences.push_enabled ?? true,
      sms: preferences.sms_enabled ?? false,
    },
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: NotificationRequest | NotificationRequest[] = await req.json();
    const notifications = Array.isArray(body) ? body : [body];
    
    const results: Array<{ success: boolean; id?: string; error?: string; skipped?: boolean }> = [];

    for (const notification of notifications) {
      const {
        user_id,
        title,
        message,
        type = "info",
        category = "general",
        priority = "normal",
        source_type,
        source_id,
        action_url,
        metadata = {},
        group_key,
        parent_id,
        expires_at,
      } = notification;

      if (!user_id || !title || !message) {
        results.push({ success: false, error: "Missing required fields: user_id, title, message" });
        continue;
      }

      // Check user preferences
      const { send } = await shouldSendNotification(supabase, user_id, category);
      if (!send) {
        results.push({ success: true, skipped: true });
        continue;
      }

      // Generate action_url if not provided
      const finalActionUrl = action_url || generateActionUrl(source_type, source_id);

      // Generate group_key for deduplication if not provided
      const finalGroupKey = group_key || (source_type && source_id ? `${source_type}:${source_id}:${title}` : null);

      // Insert notification (deduplication handled by trigger)
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          user_id,
          title,
          message,
          type,
          category,
          priority,
          source_type,
          source_id,
          action_url: finalActionUrl,
          metadata,
          group_key: finalGroupKey,
          parent_id,
          expires_at,
          read: false,
        })
        .select("id")
        .single();

      if (error) {
        // Check if it was a duplicate (trigger returns NULL)
        if (error.code === "PGRST116") {
          console.log(`Notification deduplicated for group_key: ${finalGroupKey}`);
          results.push({ success: true, skipped: true });
        } else {
          console.error("Error inserting notification:", error);
          results.push({ success: false, error: error.message });
        }
      } else {
        console.log(`Notification created: ${data?.id} for user ${user_id}`);
        results.push({ success: true, id: data?.id });
      }
    }

    const successful = results.filter((r) => r.success && !r.skipped).length;
    const skipped = results.filter((r) => r.skipped).length;
    const failed = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        success: failed === 0,
        created: successful,
        skipped,
        failed,
        results,
      }),
      {
        status: failed === results.length ? 500 : 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in unified-notification-service:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
