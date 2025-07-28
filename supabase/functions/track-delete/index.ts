import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

serve(async (req: Request) => {
  console.log("=== EMAIL DELETE TRACKING REQUEST ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const emailId = url.searchParams.get("id");

    console.log("Tracking delete for email:", emailId);

    if (!emailId) {
      console.error("Missing email ID");
      return new Response("Missing email ID", { status: 400, headers: corsHeaders });
    }

    const userAgent = req.headers.get("user-agent") || "unknown";
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Insert analytics record for delete event
    const { error: analyticsError } = await supabase
      .from("email_analytics")
      .insert({
        email_id: emailId,
        event_type: 'delete',
        ip_address: ipAddress,
        user_agent: userAgent,
        event_data: {
          timestamp: new Date().toISOString(),
          action: 'email_deleted',
          device_info: userAgent
        }
      });

    if (analyticsError) {
      console.error("Error inserting delete analytics:", analyticsError);
      return new Response(JSON.stringify({ error: "Failed to track delete" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    } else {
      console.log("Successfully tracked email delete event");
    }

    return new Response(JSON.stringify({ tracked: true, event: 'delete' }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in delete tracking:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});