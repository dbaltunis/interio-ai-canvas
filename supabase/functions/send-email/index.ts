
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

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

    // Check if Resend API key is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("Resend API key not found");
      throw new Error("Resend API key not configured");
    }

    // Get user's business settings for from email
    const { data: businessSettings } = await supabase
      .from('business_settings')
      .select('business_email, company_name')
      .eq('user_id', user.id)
      .single();

    console.log("Business settings:", businessSettings);

    const fromEmail = businessSettings?.business_email || "onboarding@resend.dev";
    const fromName = businessSettings?.company_name || "InterioApp";

    console.log("Sending via Resend with from:", fromEmail, fromName);

    // Clean up HTML content - remove CSS variables and unsupported styles
    const cleanHtml = emailData.html
      .replace(/style="[^"]*border-color:\s*hsl\(var\(--border\)\);?[^"]*"/g, '')
      .replace(/style=""/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    console.log("Cleaned HTML content:", cleanHtml);

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [emailData.to],
      subject: emailData.subject,
      html: cleanHtml
    });

    console.log("Resend response:", emailResponse);

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      throw new Error(`Resend API error: ${emailResponse.error.message}`);
    }

    const messageId = emailResponse.data?.id;
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
