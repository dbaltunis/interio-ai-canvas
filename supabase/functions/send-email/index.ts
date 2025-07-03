
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
  from_email?: string;
  from_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Email function called with method:", req.method);
  
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
    console.log("Auth header present:", !!authHeader);
    
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

    console.log("User authenticated:", user.id);

    const emailData: EmailRequest = await req.json();
    console.log("Processing email request:", { 
      to: emailData.to, 
      subject: emailData.subject,
      from: emailData.from_email || "noreply@interioapp.com"
    });

    // Get user's business settings for from email
    const { data: businessSettings } = await supabase
      .from('business_settings')
      .select('business_email, company_name')
      .eq('user_id', user.id)
      .single();

    const fromEmail = emailData.from_email || businessSettings?.business_email || "noreply@interioapp.com";
    const fromName = emailData.from_name || businessSettings?.company_name || "InterioApp";

    console.log("Sending via SendGrid with from:", fromEmail, fromName);

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
          email: fromEmail,
          name: fromName
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

    console.log("SendGrid response status:", sendGridResponse.status);

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error("SendGrid error response:", errorText);
      
      // Store failed email record
      await supabase
        .from("emails")
        .insert({
          user_id: user.id,
          recipient_email: emailData.to,
          subject: emailData.subject,
          content: emailData.content,
          template_id: emailData.template_id,
          campaign_id: emailData.campaign_id,
          client_id: emailData.client_id,
          status: "failed",
          bounce_reason: `SendGrid API error: ${sendGridResponse.status} - ${errorText}`,
          open_count: 0,
          click_count: 0,
          time_spent_seconds: 0,
        });

      throw new Error(`SendGrid API error: ${sendGridResponse.status} - ${errorText}`);
    }

    const messageId = sendGridResponse.headers.get("X-Message-Id");
    console.log("Email sent successfully, Message ID:", messageId);

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

    console.log("Email record stored in database:", data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: data.id,
        message_id: messageId,
        message: "Email sent successfully"
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
