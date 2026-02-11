import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CloudAPIRequest {
  phoneNumber: string;
  message: string;
  userId?: string;
  clientId?: string;
  templateName?: string;
  templateLanguage?: string;
  templateParams?: string[];
}

const GRAPH_API_VERSION = "v21.0";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CloudAPIRequest = await req.json();
    const { phoneNumber, message, userId, clientId, templateName, templateLanguage, templateParams } = body;

    if (!phoneNumber) {
      throw new Error("phoneNumber is required");
    }

    // Get user's WhatsApp Cloud API credentials
    const authHeader = req.headers.get("Authorization");
    let effectiveUserId = userId;

    if (authHeader && !effectiveUserId) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      effectiveUserId = user?.id;
    }

    if (!effectiveUserId) {
      throw new Error("Authentication required");
    }

    // Get account owner for sub-user support
    const { data: accountOwnerId } = await supabase.rpc('get_account_owner', {
      user_id_param: effectiveUserId
    });
    const ownerId = accountOwnerId || effectiveUserId;

    // Fetch WhatsApp Cloud API settings
    const { data: settings, error: settingsError } = await supabase
      .from('whatsapp_user_settings')
      .select('*')
      .eq('user_id', ownerId)
      .maybeSingle();

    if (settingsError || !settings) {
      throw new Error("WhatsApp Cloud API not configured. Please set up your credentials in Settings.");
    }

    // Check for Cloud API credentials (stored in the same table with cloud_ prefix fields)
    const phoneNumberId = (settings as any).cloud_phone_number_id;
    const accessToken = (settings as any).cloud_access_token;

    if (!phoneNumberId || !accessToken) {
      throw new Error("WhatsApp Cloud API credentials not configured. Please add your Phone Number ID and Access Token.");
    }

    // Clean phone number - ensure it starts with country code, no + sign for API
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

    console.log(`Sending WhatsApp Cloud API message to ${cleanPhone}`);

    // Build the message payload
    let messagePayload: any;

    if (templateName) {
      // Template message (for first contact - required within 24h window)
      messagePayload = {
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage || "en" },
          components: templateParams?.length ? [{
            type: "body",
            parameters: templateParams.map(p => ({ type: "text", text: p }))
          }] : undefined
        }
      };
    } else {
      // Free-form text message (only within 24h conversation window)
      messagePayload = {
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "text",
        text: { body: message || "Hello from InterioApp!" }
      };
    }

    // Send via Meta Graph API
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messagePayload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result.error?.message || `HTTP ${response.status}`;
      console.error("WhatsApp Cloud API error:", result);

      // Log the failed attempt
      await supabase.from('whatsapp_message_logs').insert({
        user_id: ownerId,
        client_id: clientId,
        phone_number: phoneNumber,
        message_content: message,
        status: 'failed',
        error_message: errorMsg,
        provider: 'cloud_api',
      }).catch(() => {});

      throw new Error(`WhatsApp API error: ${errorMsg}`);
    }

    const messageId = result.messages?.[0]?.id;
    console.log("WhatsApp message sent successfully, ID:", messageId);

    // Log successful send
    await supabase.from('whatsapp_message_logs').insert({
      user_id: ownerId,
      client_id: clientId,
      phone_number: phoneNumber,
      message_content: message,
      status: 'sent',
      external_message_id: messageId,
      provider: 'cloud_api',
    }).catch((err) => console.warn("Failed to log WhatsApp message:", err));

    return new Response(
      JSON.stringify({
        success: true,
        messageId,
        message: "WhatsApp message sent successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("WhatsApp Cloud API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send WhatsApp message",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
