
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const emailId = url.searchParams.get("id");

    if (!emailId) {
      return new Response("Missing email ID", { status: 400 });
    }

    console.log("Tracking email open for ID:", emailId);

    // Update email open count and status
    const { data: emailData, error: fetchError } = await supabase
      .from("emails")
      .select("open_count, status")
      .eq("id", emailId)
      .single();

    if (fetchError) {
      console.error("Error fetching email:", fetchError);
      return new Response("Email not found", { status: 404 });
    }

    const newOpenCount = (emailData.open_count || 0) + 1;
    const newStatus = emailData.status === 'sent' ? 'opened' : emailData.status;

    const { error: updateError } = await supabase
      .from("emails")
      .update({
        open_count: newOpenCount,
        status: newStatus
      })
      .eq("id", emailId);

    if (updateError) {
      console.error("Error updating email open:", updateError);
    }

    // Insert analytics record
    const { error: analyticsError } = await supabase
      .from("email_analytics")
      .insert({
        email_id: emailId,
        event_type: "opened",
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
        event_data: {
          timestamp: new Date().toISOString(),
          open_count: newOpenCount
        }
      });

    if (analyticsError) {
      console.error("Error inserting analytics:", analyticsError);
    }

    // Return a 1x1 transparent pixel
    const pixelData = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
      0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3b
    ]);

    return new Response(pixelData, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in track-email-open:", error);
    
    // Still return a pixel even if tracking fails
    const pixelData = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
      0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3b
    ]);

    return new Response(pixelData, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        ...corsHeaders,
      },
    });
  }
});
