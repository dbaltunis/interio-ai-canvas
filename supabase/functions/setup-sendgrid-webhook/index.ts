import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SetupWebhookRequest {
  sendgrid_api_key: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("SendGrid webhook setup called with method:", req.method);
  
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

    const { sendgrid_api_key }: SetupWebhookRequest = await req.json();
    
    if (!sendgrid_api_key) {
      throw new Error("SendGrid API key is required");
    }

    console.log("Setting up SendGrid webhook for user:", user.id);

    // Define the webhook URL
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/sendgrid-webhook`;
    
    // Check if webhook already exists
    const checkResponse = await fetch("https://api.sendgrid.com/v3/user/webhooks/event/settings", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${sendgrid_api_key}`,
        "Content-Type": "application/json",
      },
    });

    let webhookExists = false;
    let existingWebhookId = null;

    if (checkResponse.ok) {
      const existingSettings = await checkResponse.json();
      console.log("Existing SendGrid webhook settings:", existingSettings);
      
      // Check if our webhook URL already exists
      if (existingSettings.url === webhookUrl && existingSettings.enabled) {
        webhookExists = true;
        console.log("Webhook already configured correctly");
      } else if (existingSettings.url) {
        // There's a different webhook configured, we need to update it
        existingWebhookId = existingSettings.url;
      }
    }

    if (!webhookExists) {
      // Configure the webhook settings
      const webhookSettings = {
        enabled: true,
        url: webhookUrl,
        group_resubscribe: true,
        delivered: true,
        group_unsubscribe: true,
        spam_report: true,
        bounce: true,
        deferred: true,
        unsubscribe: true,
        processed: true,
        open: true,
        click: true,
        dropped: true
      };

      console.log("Configuring SendGrid webhook with settings:", webhookSettings);

      const setupResponse = await fetch("https://api.sendgrid.com/v3/user/webhooks/event/settings", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${sendgrid_api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookSettings),
      });

      if (!setupResponse.ok) {
        const errorText = await setupResponse.text();
        console.error("SendGrid webhook setup error:", errorText);
        throw new Error(`Failed to setup SendGrid webhook: ${setupResponse.status} - ${errorText}`);
      }

      console.log("SendGrid webhook configured successfully");
    }

    // Get account owner for proper integration storage
    const { data: accountOwnerId } = await supabase.rpc('get_account_owner', {
      user_id_param: user.id
    });

    // Store the SendGrid integration settings with both user_id and account_owner_id
    const { error: integrationError } = await supabase
      .from("integration_settings")
      .upsert({
        user_id: user.id,
        account_owner_id: accountOwnerId || user.id,
        integration_type: "sendgrid",
        active: true,
        api_credentials: {
          api_key: sendgrid_api_key
        },
        configuration: {
          api_key: sendgrid_api_key, // Also store in configuration for backward compatibility
          webhook_url: webhookUrl,
          webhook_configured: true,
          configured_at: new Date().toISOString()
        },
        last_sync: new Date().toISOString()
      }, {
        onConflict: "account_owner_id,integration_type"
      });

    if (integrationError) {
      console.error("Database error storing integration:", integrationError);
      throw integrationError;
    }

    // Test the webhook by sending a test request
    console.log("Testing webhook configuration...");
    
    const testResponse = await fetch("https://api.sendgrid.com/v3/user/webhooks/event/test", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgrid_api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl
      }),
    });

    let testResult = "unknown";
    if (testResponse.ok) {
      testResult = "success";
      console.log("Webhook test successful");
    } else {
      const testError = await testResponse.text();
      console.warn("Webhook test failed:", testError);
      testResult = "failed";
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "SendGrid webhook configured successfully",
        webhook_url: webhookUrl,
        webhook_test: testResult,
        existing_webhook: webhookExists
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in setup-sendgrid-webhook function:", error);
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

serve(handler);