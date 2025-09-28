
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
  console.log("=== EMAIL TRACKING REQUEST RECEIVED ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", Object.fromEntries(req.headers.entries()));
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const emailId = url.searchParams.get("id");

    console.log("=== PROCESSING EMAIL OPEN ===");
    console.log("Email ID:", emailId);

    if (!emailId) {
      console.error("Missing email ID");
      return returnTrackingPixel(); // Still return pixel even if no ID
    }

    console.log("Tracking email open for ID:", emailId);

    // Get user agent and IP for deduplication
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    // Check for recent identical opens (within 5 seconds) to prevent double-counting
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
    const { data: recentOpens } = await supabase
      .from("email_analytics")
      .select("id")
      .eq("email_id", emailId)
      .eq("event_type", "opened")
      .eq("ip_address", ipAddress)
      .eq("user_agent", userAgent)
      .gte("created_at", fiveSecondsAgo);

    if (recentOpens && recentOpens.length > 0) {
      console.log("Duplicate open detected within 5 seconds, returning pixel without counting");
      return returnTrackingPixel();
    }

    // Use atomic increment to avoid race conditions
    const { data: updatedEmail, error: updateError } = await supabase
      .rpc('increment_email_open_count', { 
        email_id_param: emailId 
      });

    if (updateError) {
      console.error("Error incrementing email open count:", updateError);
      // Fallback to manual method
      const { data: emailData, error: fetchError } = await supabase
        .from("emails")
        .select("open_count, status")
        .eq("id", emailId)
        .single();

      if (!fetchError && emailData) {
        const newOpenCount = (emailData.open_count || 0) + 1;
        let newStatus = emailData.status;

        if (['sent', 'delivered', 'processed'].includes(emailData.status)) {
          newStatus = 'opened';
        }

        await supabase
          .from("emails")
          .update({
            open_count: newOpenCount,
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq("id", emailId);
        
        console.log("Fallback: Updated email open count to:", newOpenCount);
      }
    } else {
      console.log("Successfully incremented email open count using atomic function");
    }

    // Insert analytics record
    const { error: analyticsError } = await supabase
      .from("email_analytics")
      .insert({
        email_id: emailId,
        event_type: "opened",
        ip_address: ipAddress,
        user_agent: userAgent,
        event_data: {
          timestamp: new Date().toISOString(),
          source: "tracking_pixel"
        }
      });

    if (analyticsError) {
      console.error("Error inserting analytics:", analyticsError);
    } else {
      console.log("Successfully inserted analytics record");
    }

    return returnTrackingPixel();
  } catch (error) {
    console.error("Error in track-email-open:", error);
    return returnTrackingPixel();
  }
});

function returnTrackingPixel() {
  // Return a 1x1 transparent pixel
  const pixelData = new Uint8Array([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
    0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3b
  ]);

  return new Response(pixelData, {
    headers: {
      ...corsHeaders,
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    },
  });
}
