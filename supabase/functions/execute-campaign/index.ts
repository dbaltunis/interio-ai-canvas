import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExecuteCampaignRequest {
  campaignId: string;
}

const SEND_DELAY_MS = 300; // 300ms between emails (respects Resend 2/sec rate limit)
const MAX_RETRIES = 2;

async function sendSingleEmail(
  to: string,
  subject: string,
  content: string,
  userId: string,
  clientId: string | null,
  campaignId: string
): Promise<{ success: boolean; emailId?: string; error?: string }> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          to,
          subject,
          message: content,
          user_id: userId,
          client_id: clientId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true, emailId: result.email_id };
      }

      // Don't retry on client errors (4xx) - these are permanent failures
      if (response.status >= 400 && response.status < 500) {
        return { success: false, error: result.error || `HTTP ${response.status}` };
      }

      // Server error (5xx) - retry with backoff
      if (attempt < MAX_RETRIES) {
        const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s
        console.log(`Retrying email to ${to} after ${backoffMs}ms (attempt ${attempt + 1})`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }

      return { success: false, error: result.error || `HTTP ${response.status} after ${MAX_RETRIES + 1} attempts` };
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }
      return { success: false, error: error.message || "Network error" };
    }
  }
  return { success: false, error: "Max retries exceeded" };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId }: ExecuteCampaignRequest = await req.json();

    if (!campaignId) {
      throw new Error("campaignId is required");
    }

    console.log(`=== EXECUTING CAMPAIGN ${campaignId} SERVER-SIDE ===`);

    // Fetch campaign record
    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error(`Campaign not found: ${campaignError?.message || "no data"}`);
    }

    // Update campaign status to sending
    await supabase
      .from("email_campaigns")
      .update({ status: "sending", sent_at: new Date().toISOString() })
      .eq("id", campaignId);

    // Fetch all pending recipients for this campaign
    const { data: recipients, error: recipientsError } = await supabase
      .from("campaign_recipients")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (recipientsError) {
      throw new Error(`Failed to fetch recipients: ${recipientsError.message}`);
    }

    if (!recipients || recipients.length === 0) {
      console.log("No pending recipients found for campaign");
      await supabase
        .from("email_campaigns")
        .update({ status: "completed" })
        .eq("id", campaignId);
      return new Response(
        JSON.stringify({ success: true, total: 0, sent: 0, failed: 0 }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing ${recipients.length} recipients`);

    let successCount = 0;
    let failureCount = 0;

    for (const recipient of recipients) {
      // Personalize content
      let personalizedContent = campaign.content;
      let personalizedSubject = campaign.subject;

      if (recipient.name) {
        personalizedContent = personalizedContent.replace(/\{\{client_name\}\}/g, recipient.name);
        personalizedSubject = personalizedSubject.replace(/\{\{client_name\}\}/g, recipient.name);
      } else {
        personalizedContent = personalizedContent.replace(/\{\{client_name\}\}/g, "Valued Client");
        personalizedSubject = personalizedSubject.replace(/\{\{client_name\}\}/g, "Valued Client");
      }

      // Replace company_name if present
      personalizedContent = personalizedContent.replace(/\{\{company_name\}\}/g, recipient.name || "");
      personalizedSubject = personalizedSubject.replace(/\{\{company_name\}\}/g, recipient.name || "");

      const result = await sendSingleEmail(
        recipient.email,
        personalizedSubject,
        personalizedContent,
        campaign.user_id,
        recipient.client_id,
        campaignId
      );

      // Update recipient status
      await supabase
        .from("campaign_recipients")
        .update({
          status: result.success ? "sent" : "failed",
          email_id: result.emailId || null,
          error_message: result.error || null,
          processed_at: new Date().toISOString(),
        })
        .eq("id", recipient.id);

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
        console.error(`Failed to send to ${recipient.email}: ${result.error}`);
      }

      // Rate limiting delay between sends
      await new Promise(resolve => setTimeout(resolve, SEND_DELAY_MS));
    }

    // Update campaign status to completed
    await supabase
      .from("email_campaigns")
      .update({
        status: "completed",
        recipient_count: recipients.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId);

    console.log(`Campaign ${campaignId} complete: ${successCount} sent, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        total: recipients.length,
        sent: successCount,
        failed: failureCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Campaign execution error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Campaign execution failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
