
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
  reason?: string;
  type?: string;
  smtp_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("SendGrid webhook called with method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const events: SendGridEvent[] = await req.json();
    console.log("Received SendGrid webhook events:", events.length);

    for (const event of events) {
      console.log("Processing SendGrid event:", event);

      // Find the email record by SendGrid message ID
      const { data: emailRecord, error: findError } = await supabase
        .from("emails")
        .select()
        .eq("sendgrid_message_id", event.sg_message_id)
        .single();

      if (findError) {
        console.error("Could not find email record for message ID:", event.sg_message_id, findError);
        
        // Try to find by email address and recent timestamp if message ID doesn't match
        const recentTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Last 24 hours
        const { data: fallbackRecord, error: fallbackError } = await supabase
          .from("emails")
          .select()
          .eq("recipient_email", event.email)
          .gte("sent_at", recentTime)
          .order("sent_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fallbackError || !fallbackRecord) {
          console.error("Could not find fallback email record:", fallbackError);
          continue;
        }
        
        // Use the fallback record
        console.log("Using fallback email record:", fallbackRecord.id);
        emailRecord = fallbackRecord;
      }

      // Update email status and tracking data
      const updates: any = {
        updated_at: new Date().toISOString()
      };
      
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
        case "blocked":
        case "dropped":
          updates.status = "bounced";
          updates.bounce_reason = event.reason || `Email ${event.event}: ${event.type || 'Unknown reason'}`;
          break;
        case "unsubscribe":
        case "spamreport":
          updates.status = "failed";
          updates.bounce_reason = event.reason || `Email marked as ${event.event}`;
          break;
        case "deferred":
          // Deferred is temporary, don't change status to failed
          updates.bounce_reason = event.reason || "Email temporarily deferred";
          break;
      }

      if (Object.keys(updates).length > 1) { // More than just updated_at
        const { error: updateError } = await supabase
          .from("emails")
          .update(updates)
          .eq("id", emailRecord.id);

        if (updateError) {
          console.error("Error updating email record:", updateError);
        } else {
          console.log("Email record updated successfully:", emailRecord.id, "Event:", event.event);
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
            reason: event.reason,
            type: event.type,
            smtp_id: event.smtp_id
          },
          ip_address: event.ip,
          user_agent: event.useragent,
        });

      if (analyticsError) {
        console.error("Error storing analytics:", analyticsError);
      } else {
        console.log("Analytics stored successfully for email:", emailRecord.id);
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
