
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Test SendGrid webhook called with method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Set the auth context
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      console.error("Auth error:", authError);
      throw new Error("Invalid authentication");
    }

    // Check SendGrid webhook configuration
    const { data: integrationData, error: integrationError } = await supabase
      .from("integration_settings")
      .select("*")
      .eq("user_id", user.id)
      .eq("integration_type", "sendgrid")
      .eq("active", true)
      .maybeSingle();

    if (integrationError) {
      console.error("Error fetching integration:", integrationError);
      throw integrationError;
    }

    let webhookStatus = "not_configured";
    let webhookUrl = "";
    let sendgridApiKey = "";

    // First check database configuration
    if (integrationData && integrationData.configuration?.webhook_configured) {
      webhookStatus = "configured";
      webhookUrl = integrationData.configuration?.webhook_url || "";
      sendgridApiKey = integrationData.api_credentials?.api_key || "";
      console.log("Webhook marked as configured in database");
    } else if (integrationData) {
      sendgridApiKey = integrationData.api_credentials?.api_key || "";
      console.log("Integration exists but webhook not marked as configured");
    }

    // Test SendGrid API connection if we have the key
    let sendgridApiStatus = "no_key";
    let webhookSettings = null;

    if (sendgridApiKey) {
      try {
        const sendgridResponse = await fetch("https://api.sendgrid.com/v3/user/webhooks/event/settings", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${sendgridApiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (sendgridResponse.ok) {
          webhookSettings = await sendgridResponse.json();
          sendgridApiStatus = "connected";
          
          // Double-check webhook status from SendGrid API if database says it's configured
          if (webhookStatus === "configured" && webhookSettings) {
            if (!webhookSettings.enabled || !webhookSettings.url) {
              console.log("Database shows configured but SendGrid API shows disabled/no URL");
              webhookStatus = "needs_attention";
            }
          }
        } else {
          sendgridApiStatus = "invalid_key";
        }
      } catch (error) {
        console.error("SendGrid API test error:", error);
        sendgridApiStatus = "error";
      }
    }

    // Check recent email analytics to see if webhook is working
    const { data: recentEmails, error: emailError } = await supabase
      .from("emails")
      .select("id, open_count, click_count, status, sent_at, updated_at")
      .eq("user_id", user.id)
      .order("sent_at", { ascending: false })
      .limit(5);

    if (emailError) {
      console.error("Error fetching emails:", emailError);
    }

    // Check recent analytics events
    const { data: analyticsEvents, error: analyticsError } = await supabase
      .from("email_analytics")
      .select("id, email_id, event_type, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (analyticsError) {
      console.error("Error fetching analytics:", analyticsError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        diagnostic: {
          webhook_status: webhookStatus,
          webhook_url: webhookUrl,
          sendgrid_api_status: sendgridApiStatus,
          sendgrid_webhook_settings: webhookSettings,
          recent_emails: recentEmails || [],
          recent_analytics: analyticsEvents || [],
          recommendations: generateRecommendations(webhookStatus, sendgridApiStatus, webhookSettings, recentEmails || [], analyticsEvents || [])
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in test-sendgrid-webhook function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateRecommendations(webhookStatus: string, apiStatus: string, webhookSettings: any, emails: any[], analytics: any[]) {
  const recommendations = [];

  if (apiStatus === "no_key") {
    recommendations.push("❌ No SendGrid API key found. Please configure SendGrid integration first.");
  } else if (apiStatus === "invalid_key") {
    recommendations.push("❌ SendGrid API key is invalid. Please check your API key.");
  } else if (apiStatus === "connected") {
    recommendations.push("✅ SendGrid API connection is working.");
  }

  if (webhookStatus === "not_configured") {
    recommendations.push("❌ Webhook is not configured. Run the webhook setup function.");
  } else if (webhookStatus === "needs_attention") {
    recommendations.push("⚠️ Webhook configured in database but needs attention in SendGrid dashboard.");
  } else if (webhookStatus === "configured") {
    recommendations.push("✅ Webhook is configured in database.");
  }

  if (webhookSettings) {
    if (!webhookSettings.enabled) {
      recommendations.push("❌ SendGrid webhook is disabled. Enable it in SendGrid dashboard.");
    } else if (!webhookSettings.open) {
      recommendations.push("❌ SendGrid webhook is not configured to track 'open' events.");
    } else {
      recommendations.push("✅ SendGrid webhook is properly configured for tracking.");
    }
  }

  if (emails && emails.length > 0) {
    const emailsWithOpens = emails.filter(e => e.open_count > 0);
    if (emailsWithOpens.length === 0) {
      recommendations.push("⚠️ No emails show any opens. This suggests webhook is not receiving events.");
    } else {
      recommendations.push(`✅ ${emailsWithOpens.length} emails have recorded opens.`);
    }
  }

  if (!analytics || analytics.length === 0) {
    recommendations.push("⚠️ No analytics events recorded. Webhook might not be receiving events.");
  } else {
    recommendations.push(`✅ ${analytics.length} analytics events recorded recently.`);
  }

  return recommendations;
}

serve(handler);
