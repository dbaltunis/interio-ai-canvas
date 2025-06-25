
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendGridEvent {
  email: string;
  timestamp: number;
  event: string;
  sg_message_id: string;
  useragent?: string;
  ip?: string;
  url?: string;
  user_id?: string;
  template_id?: string;
  campaign_id?: string;
  client_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const events: SendGridEvent[] = await req.json();

    for (const event of events) {
      console.log("Processing SendGrid event:", event);

      // Find the email record by SendGrid message ID
      const { data: emailRecord, error: findError } = await supabase
        .from("emails")
        .select()
        .eq("sendgrid_message_id", event.sg_message_id)
        .single();

      if (findError) {
        console.error("Could not find email record:", findError);
        continue;
      }

      // Update email status and tracking data
      const updates: any = {};
      
      switch (event.event) {
        case "delivered":
          updates.status = "delivered";
          updates.delivered_at = new Date(event.timestamp * 1000).toISOString();
          break;
        case "open":
          updates.status = "opened";
          updates.opened_at = new Date(event.timestamp * 1000).toISOString();
          updates.open_count = (emailRecord.open_count || 0) + 1;
          break;
        case "click":
          updates.status = "clicked";
          updates.clicked_at = new Date(event.timestamp * 1000).toISOString();
          updates.click_count = (emailRecord.click_count || 0) + 1;
          break;
        case "bounce":
        case "dropped":
          updates.status = "bounced";
          updates.bounce_reason = event.reason || "Unknown bounce reason";
          break;
        case "unsubscribe":
        case "spamreport":
          updates.status = "failed";
          break;
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from("emails")
          .update(updates)
          .eq("id", emailRecord.id);

        if (updateError) {
          console.error("Error updating email record:", updateError);
        }
      }

      // Store detailed analytics
      const { error: analyticsError } = await supabase
        .from("email_analytics")
        .insert({
          email_id: emailRecord.id,
          event_type: event.event,
          event_data: {
            timestamp: event.timestamp,
            url: event.url,
            useragent: event.useragent,
          },
          ip_address: event.ip,
          user_agent: event.useragent,
        });

      if (analyticsError) {
        console.error("Error storing analytics:", analyticsError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: events.length }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in sendgrid-webhook function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
