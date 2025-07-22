
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  emailId: string;
  attachmentPaths?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { to, subject, html, emailId, attachmentPaths }: SendEmailRequest = await req.json();
    
    // Get SendGrid API key from integration settings
    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get("Authorization")?.replace("Bearer ", "") ?? ""
    );
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data: integration } = await supabase
      .from("integration_settings")
      .select("api_credentials")
      .eq("user_id", user.id)
      .eq("integration_type", "sendgrid")
      .eq("active", true)
      .single();

    const sendgridApiKey = integration?.api_credentials?.api_key || Deno.env.get("SENDGRID_API_KEY");
    
    if (!sendgridApiKey) {
      throw new Error("SendGrid API key not configured");
    }

    // Get user's email settings - REQUIRED for verified sender
    const { data: emailSettings } = await supabase
      .from("email_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!emailSettings || !emailSettings.from_email) {
      console.error("No email settings configured for user:", user.id);
      throw new Error("Email settings are required. Please configure your verified sender email address in Settings > Email Settings.");
    }

    const fromEmail = emailSettings.from_email;
    const fromName = emailSettings.from_name;
    
    console.log(`Using verified sender: ${fromName} <${fromEmail}>`);

    // Prepare email data
    const emailData: any = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: {
        email: fromEmail,
        name: fromName,
      },
      content: [
        {
          type: "text/html",
          value: html,
        },
      ],
      custom_args: {
        email_id: emailId,
      },
    };

    // Add reply-to if configured
    if (emailSettings?.reply_to_email) {
      emailData.reply_to = {
        email: emailSettings.reply_to_email,
        name: fromName,
      };
    }

    // Add attachments if provided
    if (attachmentPaths && attachmentPaths.length > 0) {
      emailData.attachments = [];
      
      for (const path of attachmentPaths) {
        try {
          const { data: fileData } = await supabase.storage
            .from('email-attachments')
            .download(path);
          
          if (fileData) {
            const arrayBuffer = await fileData.arrayBuffer();
            const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            const fileName = path.split('/').pop() || 'attachment';
            
            emailData.attachments.push({
              content: base64Content,
              filename: fileName,
              type: fileData.type || 'application/octet-stream',
              disposition: 'attachment',
            });
          }
        } catch (error) {
          console.error("Error processing attachment:", error);
        }
      }
    }

    console.log("Sending email via SendGrid:", { to, subject, from: fromEmail });

    // Send email via SendGrid
    const sendResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.error("SendGrid error:", errorText);
      throw new Error(`SendGrid API error: ${sendResponse.status} - ${errorText}`);
    }

    // Update email status to sent
    await supabase
      .from("emails")
      .update({ 
        status: "sent", 
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", emailId);

    console.log("Email sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        messageId: sendResponse.headers.get("x-message-id")
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
