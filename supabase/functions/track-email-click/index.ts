
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
    const targetUrl = url.searchParams.get("url");

    if (!emailId || !targetUrl) {
      console.error("Missing parameters - emailId:", emailId, "targetUrl:", targetUrl);
      return new Response("Missing parameters", { status: 400 });
    }

    console.log("Tracking email click for ID:", emailId, "URL:", targetUrl);

    // Get current email data
    const { data: emailData, error: fetchError } = await supabase
      .from("emails")
      .select("click_count, status")
      .eq("id", emailId)
      .single();

    if (fetchError) {
      console.error("Error fetching email:", fetchError);
      // Still redirect to avoid broken user experience
      return redirectToUrl(targetUrl);
    }

    console.log("Current email data:", emailData);

    // Increment click count
    const newClickCount = (emailData.click_count || 0) + 1;
    let newStatus = emailData.status;

    // Update status to 'clicked' if it was 'sent', 'delivered', or 'opened'
    if (['sent', 'delivered', 'opened'].includes(emailData.status)) {
      newStatus = 'clicked';
    }

    console.log("Updating email with click count:", newClickCount, "status:", newStatus);

    // Update email with new click count and status
    const { error: updateError } = await supabase
      .from("emails")
      .update({
        click_count: newClickCount,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", emailId);

    if (updateError) {
      console.error("Error updating email click count:", updateError);
    } else {
      console.log("Successfully updated email click count to:", newClickCount);
    }

    // Insert analytics record
    const { error: analyticsError } = await supabase
      .from("email_analytics")
      .insert({
        email_id: emailId,
        event_type: "clicked",
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
        event_data: { 
          target_url: targetUrl,
          timestamp: new Date().toISOString(),
          click_count: newClickCount
        }
      });

    if (analyticsError) {
      console.error("Error inserting analytics:", analyticsError);
    } else {
      console.log("Successfully inserted analytics record");
    }

    return redirectToUrl(targetUrl);
  } catch (error) {
    console.error("Error in track-email-click:", error);
    
    // Still try to redirect
    const targetUrl = new URL(req.url).searchParams.get("url");
    if (targetUrl) {
      return redirectToUrl(targetUrl);
    }
    
    return new Response("Error", { status: 500, headers: corsHeaders });
  }
});

function redirectToUrl(targetUrl: string) {
  return new Response(null, {
    status: 302,
    headers: {
      "Location": targetUrl,
      ...corsHeaders,
    },
  });
}
