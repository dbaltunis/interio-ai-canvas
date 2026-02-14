import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map Resend event types to our email status
const EVENT_STATUS_MAP: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "sent",      // Keep as sent, retry pending
  "email.bounced": "bounced",
  "email.complained": "bounced",          // Spam complaint = treat as bounce
  "email.opened": "opened",
  "email.clicked": "clicked",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Resend webhook event:", JSON.stringify(body));

    const eventType = body.type;
    const eventData = body.data;

    if (!eventType || !eventData) {
      console.error("Invalid webhook payload - missing type or data");
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const recipientEmail = eventData.to?.[0] || eventData.email_id;
    const resendEmailId = eventData.email_id;

    console.log(`Processing ${eventType} for recipient: ${recipientEmail}`);

    // Try to find the email record
    // Resend doesn't send our custom email_id back, so we match by recipient + recent timestamp
    let emailRecord = null;

    if (recipientEmail) {
      // Find the most recent email to this recipient
      const { data, error } = await supabase
        .from("emails")
        .select("id, status")
        .eq("recipient_email", recipientEmail)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        emailRecord = data;
      }
    }

    if (!emailRecord) {
      console.log(`No matching email record found for ${recipientEmail}`);
      return new Response(JSON.stringify({ received: true, matched: false }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const newStatus = EVENT_STATUS_MAP[eventType];

    if (newStatus) {
      // Only update status if it's a "forward" progression
      // (don't downgrade 'opened' back to 'delivered')
      const statusPriority: Record<string, number> = {
        queued: 0,
        processed: 1,
        sent: 2,
        delivered: 3,
        opened: 4,
        clicked: 5,
        bounced: 10,  // Bounced always overrides
        failed: 10,
      };

      const currentPriority = statusPriority[emailRecord.status] ?? 0;
      const newPriority = statusPriority[newStatus] ?? 0;

      if (newPriority > currentPriority) {
        const updateData: any = {
          status: newStatus,
          updated_at: new Date().toISOString(),
        };

        // Add bounce reason for bounced/complained events
        if (eventType === "email.bounced") {
          updateData.bounce_reason = eventData.bounce?.message || eventData.reason || "Email bounced";
        } else if (eventType === "email.complained") {
          updateData.bounce_reason = "Recipient marked as spam";
        }

        await supabase
          .from("emails")
          .update(updateData)
          .eq("id", emailRecord.id);

        console.log(`Updated email ${emailRecord.id} status: ${emailRecord.status} -> ${newStatus}`);
      } else {
        console.log(`Skipping status update: ${emailRecord.status} (${currentPriority}) -> ${newStatus} (${newPriority})`);
      }
    }

    // Create in-app notification for bounce/complaint events
    if (eventType === "email.bounced" || eventType === "email.complained") {
      try {
        // Get the email sender (user_id) to notify them
        const { data: emailData } = await supabase
          .from("emails")
          .select("user_id, subject, recipient_email")
          .eq("id", emailRecord.id)
          .single();

        if (emailData?.user_id) {
          const bounceReason = eventType === "email.complained"
            ? "Recipient marked as spam"
            : eventData.bounce?.message || eventData.reason || "Email bounced";

          await supabase
            .from("notifications")
            .insert({
              user_id: emailData.user_id,
              type: "error",
              title: eventType === "email.complained" ? "Email Marked as Spam" : "Email Bounced",
              message: `Email to ${emailData.recipient_email || recipientEmail}${emailData.subject ? ' ("' + emailData.subject + '")' : ''} failed: ${bounceReason}`,
              category: "email",
              source_type: "email",
              source_id: emailRecord.id,
              action_url: "/emails",
            });
          console.log("Bounce/complaint notification created for user:", emailData.user_id);
        }
      } catch (notifError: any) {
        console.warn("Failed to create bounce notification:", notifError.message);
      }
    }

    // Log to email_analytics for all events
    await supabase
      .from("email_analytics")
      .insert({
        email_id: emailRecord.id,
        event_type: eventType.replace("email.", ""),
        event_data: {
          resend_email_id: resendEmailId,
          timestamp: eventData.created_at || new Date().toISOString(),
          ...eventData,
        },
        user_agent: req.headers.get("user-agent") || "resend-webhook",
        ip_address: req.headers.get("x-forwarded-for") || "webhook",
      });

    return new Response(
      JSON.stringify({ received: true, matched: true, emailId: emailRecord.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Resend webhook error:", error);
    // Always return 200 to avoid Resend retrying
    return new Response(
      JSON.stringify({ received: true, error: error.message }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
