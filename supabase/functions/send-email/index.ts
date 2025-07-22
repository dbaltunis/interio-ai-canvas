
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
  console.log("=== SEND EMAIL FUNCTION CALLED ===");
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Supabase client created successfully");

    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);

    let emailRequest: SendEmailRequest;
    try {
      emailRequest = JSON.parse(requestBody);
      console.log("Parsed email request:", emailRequest);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      throw new Error("Invalid JSON in request body");
    }

    const { to, subject, html, emailId, attachmentPaths } = emailRequest;
    
    // Validate required fields
    if (!to || !subject || !html || !emailId) {
      console.error("Missing required fields:", { to: !!to, subject: !!subject, html: !!html, emailId: !!emailId });
      throw new Error("Missing required fields: to, subject, html, emailId");
    }

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User authentication failed:", userError);
      throw new Error("User not authenticated");
    }

    console.log("User authenticated:", user.id);

    // Get SendGrid API key from integration settings
    console.log("Fetching SendGrid integration settings...");
    const { data: integration, error: integrationError } = await supabase
      .from("integration_settings")
      .select("api_credentials")
      .eq("user_id", user.id)
      .eq("integration_type", "sendgrid")
      .eq("active", true)
      .maybeSingle();

    if (integrationError) {
      console.error("Integration query error:", integrationError);
      throw new Error("Failed to fetch integration settings");
    }

    console.log("Integration data:", integration);

    const sendgridApiKey = integration?.api_credentials?.api_key || Deno.env.get("SENDGRID_API_KEY");
    
    if (!sendgridApiKey) {
      console.error("No SendGrid API key found");
      throw new Error("SendGrid API key not configured. Please set up your SendGrid integration first.");
    }

    console.log("SendGrid API key found, length:", sendgridApiKey.length);

    // Get user's email settings - REQUIRED for verified sender
    console.log("Fetching user email settings...");
    const { data: emailSettings, error: settingsError } = await supabase
      .from("email_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (settingsError) {
      console.error("Email settings query error:", settingsError);
      throw new Error("Failed to fetch email settings");
    }

    console.log("Email settings:", emailSettings);

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
      console.log("Processing attachments:", attachmentPaths.length);
      emailData.attachments = [];
      
      for (const path of attachmentPaths) {
        try {
          const { data: fileData, error: fileError } = await supabase.storage
            .from('email-attachments')
            .download(path);
          
          if (fileError) {
            console.error("Error downloading attachment:", fileError);
            continue;
          }
          
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
            
            console.log("Attachment processed:", fileName);
          }
        } catch (error) {
          console.error("Error processing attachment:", error);
        }
      }
    }

    console.log("Sending email via SendGrid...");
    console.log("Email data:", { 
      to, 
      subject, 
      from: fromEmail,
      attachments: emailData.attachments?.length || 0 
    });

    // Send email via SendGrid
    const sendResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    console.log("SendGrid response status:", sendResponse.status);

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.error("SendGrid error details:", {
        status: sendResponse.status,
        statusText: sendResponse.statusText,
        error: errorText
      });
      
      // Parse SendGrid error for better user feedback
      let errorMessage = `SendGrid API error: ${sendResponse.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].message;
        }
      } catch (parseError) {
        console.error("Failed to parse SendGrid error:", parseError);
      }
      
      // Update email status to failed with detailed reason
      await supabase
        .from("emails")
        .update({ 
          status: "failed", 
          bounce_reason: errorMessage,
          updated_at: new Date().toISOString()
        })
        .eq("id", emailId);
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          success: false 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Update email status to sent
    const { error: updateError } = await supabase
      .from("emails")
      .update({ 
        status: "sent", 
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", emailId);

    if (updateError) {
      console.error("Failed to update email status:", updateError);
    }

    console.log("Email sent successfully");

    const messageId = sendResponse.headers.get("x-message-id");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        messageId: messageId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("=== ERROR IN SEND-EMAIL FUNCTION ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
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
