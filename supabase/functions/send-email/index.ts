
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  emailId?: string;
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
      hasContent: !!emailData.html
    });

    // Check if SendGrid API key is available
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendGridApiKey) {
      console.error("SendGrid API key not found");
      throw new Error("SendGrid API key not configured");
    }

    // Get user's business settings for from email
    const { data: businessSettings } = await supabase
      .from('business_settings')
      .select('business_email, company_name')
      .eq('user_id', user.id)
      .single();

    console.log("Business settings:", businessSettings);

    const fromEmail = businessSettings?.business_email || "noreply@interioapp.com";
    const fromName = businessSettings?.company_name || "InterioApp";

    console.log("Sending via SendGrid with from:", fromEmail, fromName);

    // Clean up HTML content - remove CSS variables and unsupported styles
    const cleanHtml = emailData.html
      .replace(/style="[^"]*border-color:\s*hsl\(var\(--border\)\);?[^"]*"/g, '')
      .replace(/style=""/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    console.log("Cleaned HTML content:", cleanHtml);

    // Send email via SendGrid
    const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendGridApiKey}`,
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
          value: cleanHtml
        }],
        tracking_settings: {
          click_tracking: { 
            enable: true,
            enable_text: true 
          },
          open_tracking: { 
            enable: true,
            substitution_tag: "%opentrack%"
          },
          subscription_tracking: {
            enable: false
          }
        },
        custom_args: {
          user_id: user.id,
          email_id: emailData.emailId || ""
        }
      }),
    });

    console.log("SendGrid response status:", sendGridResponse.status);

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error("SendGrid error response:", errorText);
      throw new Error(`SendGrid API error: ${sendGridResponse.status} - ${errorText}`);
    }

    const messageId = sendGridResponse.headers.get("X-Message-Id");
    console.log("Email sent successfully, Message ID:", messageId);

    // Update email record in database if emailId is provided
    if (emailData.emailId) {
      const { error: updateError } = await supabase
        .from("emails")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          sendgrid_message_id: messageId,
          updated_at: new Date().toISOString()
        })
        .eq('id', emailData.emailId);

      if (updateError) {
        console.error("Failed to update email status:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: messageId,
        message: "Email sent successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in send-email function:", error);
    
    // Return proper error response
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error occurred",
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
