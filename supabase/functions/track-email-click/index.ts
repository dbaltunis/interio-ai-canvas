
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
      return new Response("Missing parameters", { status: 400 });
    }

    console.log("Tracking email click for ID:", emailId, "URL:", targetUrl);

    // Update email click count and status
    const { data: emailData, error: fetchError } = await supabase
      .from("emails")
      .select("click_count, status")
      .eq("id", emailId)
      .single();

    if (fetchError) {
      console.error("Error fetching email:", fetchError);
      // Still redirect even if tracking fails
      return new Response(null, {
        status: 302,
        headers: {
          "Location": targetUrl,
          ...corsHeaders,
        },
      });
    }

    const newClickCount = (emailData.click_count || 0) + 1;
    const newStatus = ['sent', 'opened'].includes(emailData.status) ? 'clicked' : emailData.status;

    const { error: updateError } = await supabase
      .from("emails")
      .update({
        click_count: newClickCount,
        status: newStatus
      })
      .eq("id", emailId);

    if (updateError) {
      console.error("Error updating email click:", updateError);
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
    }

    // Redirect to the target URL
    return new Response(null, {
      status: 302,
      headers: {
        "Location": targetUrl,
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in track-email-click:", error);
    
    // Still redirect even if tracking fails
    const targetUrl = new URL(req.url).searchParams.get("url");
    if (targetUrl) {
      return new Response(null, {
        status: 302,
        headers: {
          "Location": targetUrl,
          ...corsHeaders,
        },
      });
    }
    
    return new Response("Error", { status: 500, headers: corsHeaders });
  }
});
