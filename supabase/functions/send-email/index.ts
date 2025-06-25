
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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
      throw new Error("Invalid authentication");
    }

    const emailData: EmailRequest = await req.json();

    // Send email via SendGrid
    const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SENDGRID_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: emailData.to }],
          subject: emailData.subject,
        }],
        from: {
          email: "noreply@interioapp.com",
          name: "InterioApp"
        },
        content: [{
          type: "text/html",
          value: emailData.content
        }],
        tracking_settings: {
          click_tracking: { enable: true },
          open_tracking: { enable: true },
        },
        custom_args: {
          user_id: user.id,
          template_id: emailData.template_id || "",
          campaign_id: emailData.campaign_id || "",
          client_id: emailData.client_id || "",
        }
      }),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error("SendGrid error:", errorText);
      throw new Error(`SendGrid API error: ${sendGridResponse.status}`);
    }

    const messageId = sendGridResponse.headers.get("X-Message-Id");

    // Store email record in database
    const { data, error } = await supabase
      .from("emails")
      .insert({
        user_id: user.id,
        recipient_email: emailData.to,
        subject: emailData.subject,
        content: emailData.content,
        template_id: emailData.template_id,
        campaign_id: emailData.campaign_id,
        client_id: emailData.client_id,
        status: "sent",
        sent_at: new Date().toISOString(),
        sendgrid_message_id: messageId,
        open_count: 0,
        click_count: 0,
        time_spent_seconds: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: data.id,
        message_id: messageId 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
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
