import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("=== SEND EMAIL FUNCTION CALLED ===");
  console.log("Request method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log("Request body:", requestBody);

    const { to, subject, content, client_id } = requestBody;

    // Validate required fields
    if (!to || !subject || !content) {
      console.error("Missing required fields:", { to: !!to, subject: !!subject, content: !!content });
      throw new Error("Missing required fields: to, subject, and content are required");
    }

    // Get the authorization header and extract the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header found");
      throw new Error("Authorization header is required");
    }

    // Create Supabase client with the user's session
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      throw new Error("Server configuration error");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Get user from the authorization header
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Failed to get user:", userError);
      throw new Error("Authentication failed");
    }

    console.log("User authenticated:", user.id);

    // Check for SendGrid integration
    console.log("Checking for SendGrid integration...");
    const { data: integration, error: integrationError } = await supabase
      .from("integration_settings")
      .select("*")
      .eq("user_id", user.id)
      .eq("integration_type", "sendgrid")
      .eq("active", true)
      .maybeSingle();

    if (integrationError) {
      console.error("Error fetching integration:", integrationError);
      throw new Error("Failed to check SendGrid integration");
    }

    if (!integration) {
      console.error("No active SendGrid integration found");
      throw new Error("SendGrid integration required. Please configure SendGrid in Settings → Integrations.");
    }

    console.log("Integration data:", integration);

    let sendgridApiKey: string | null = null;
    
    if (integration?.api_credentials && typeof integration.api_credentials === 'object' && integration.api_credentials !== null) {
      const credentials = integration.api_credentials as Record<string, any>;
      sendgridApiKey = credentials.api_key || null;
    }
    
    if (!sendgridApiKey) {
      sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    }
    
    if (!sendgridApiKey) {
      console.error("No SendGrid API key found");
      throw new Error("SendGrid API key not configured");
    }

    console.log("SendGrid API key found");

    // Get email settings
    console.log("Fetching email settings...");
    const { data: emailSettings, error: settingsError } = await supabase
      .from("email_settings")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle();

    if (settingsError) {
      console.error("Error fetching email settings:", settingsError);
      throw new Error("Failed to fetch email settings");
    }

    if (!emailSettings) {
      console.error("No email settings found");
      throw new Error("Email settings required. Please configure your sender email in Settings → Email Settings.");
    }

    const fromEmail = emailSettings.from_email;
    const fromName = emailSettings.from_name;
    
    console.log(`Using sender: ${fromName} <${fromEmail}>`);

    // Validate sender identity with SendGrid first
    console.log("Validating sender identity with SendGrid...");
    try {
      const verifyResponse = await fetch("https://api.sendgrid.com/v3/verified_senders", {
        headers: {
          "Authorization": `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (verifyResponse.ok) {
        const verifiedSenders = await verifyResponse.json();
        const isVerified = verifiedSenders.results?.some((sender: any) => 
          sender.from_email === fromEmail && sender.verified
        );
        
        if (!isVerified) {
          console.error("Sender email not verified:", fromEmail);
          throw new Error(`The email address "${fromEmail}" is not verified in SendGrid. Please verify this email as a Sender Identity in your SendGrid account before sending emails.`);
        }
        
        console.log("Sender email verified successfully");
      } else {
        console.warn("Could not verify sender identity, proceeding anyway");
      }
    } catch (verifyError) {
      console.warn("Sender verification check failed:", verifyError);
      // Don't fail the entire operation, just log the warning
    }

    // Create email record first to get the ID for tracking
    console.log("Creating email record...");
    const { data: emailRecord, error: emailError } = await supabase
      .from("emails")
      .insert({
        user_id: user.id,
        client_id: client_id || null,
        recipient_email: to,
        subject: subject,
        content: content,
        status: "queued"
      })
      .select()
      .single();

    if (emailError || !emailRecord) {
      console.error("Error creating email record:", emailError);
      throw new Error("Failed to create email record");
    }

    console.log("Email record created with ID:", emailRecord.id);

    // Add tracking to the email content
    const trackingPixelUrl = `${supabaseUrl}/functions/v1/track-email-open?id=${emailRecord.id}`;
    const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" />`;
    
    // Function to wrap links with click tracking
    const addClickTracking = (htmlContent: string): string => {
      return htmlContent.replace(
        /<a\s+([^>]*href=["']([^"']+)["'][^>]*)>/gi,
        (match, attributes, url) => {
          const trackingUrl = `${supabaseUrl}/functions/v1/track-email-click?id=${emailRecord.id}&url=${encodeURIComponent(url)}`;
          return `<a ${attributes.replace(/href=["'][^"']*["']/, `href="${trackingUrl}"`)} data-original-url="${url}">`;
        }
      );
    };

    // Process content for tracking
    let processedContent = content;
    if (content.includes('<html') || content.includes('<body')) {
      // HTML email - add tracking pixel before closing body tag
      processedContent = addClickTracking(content);
      if (processedContent.includes('</body>')) {
        processedContent = processedContent.replace('</body>', `${trackingPixel}</body>`);
      } else {
        processedContent += trackingPixel;
      }
    } else {
      // Plain text email - convert to HTML and add tracking
      processedContent = `<html><body>${content.replace(/\n/g, '<br>')}</body></html>`;
      processedContent = addClickTracking(processedContent);
      processedContent = processedContent.replace('</body>', `${trackingPixel}</body>`);
    }

    // Prepare email data
    const emailData: any = {
      personalizations: [
        {
          to: [{ email: to }],
        },
      ],
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject: subject,
      content: [
        {
          type: "text/html",
          value: processedContent,
        },
      ],
      custom_args: {
        email_id: emailRecord.id,
        user_id: user.id,
      },
    };

    // Add reply-to if configured
    if (emailSettings.reply_to_email) {
      emailData.reply_to = {
        email: emailSettings.reply_to_email,
      };
    }

    console.log("Sending email via SendGrid...");

    // Send email via SendGrid
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    console.log("SendGrid response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SendGrid error response:", errorText);
      
      let errorMessage = `SendGrid API error (${response.status})`;
      
      // Try to parse SendGrid error response
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors && errorData.errors.length > 0) {
          const firstError = errorData.errors[0];
          errorMessage = firstError.message;
          
          // Provide more helpful error messages for common issues
          if (errorMessage.includes("verified Sender Identity")) {
            errorMessage = `Email address "${fromEmail}" is not verified in SendGrid. Please verify this email as a Sender Identity in your SendGrid account. Visit https://app.sendgrid.com/settings/sender_auth to verify your email.`;
          } else if (errorMessage.includes("The from address does not match")) {
            errorMessage = `The sender email "${fromEmail}" must be verified in SendGrid before sending emails. Please verify this email address in your SendGrid account.`;
          }
        }
      } catch (parseError) {
        console.error("Failed to parse SendGrid error:", parseError);
        errorMessage = `SendGrid error: ${errorText}`;
      }
      
      // Update email status to failed
      await supabase
        .from("emails")
        .update({
          status: "failed",
          bounce_reason: errorMessage,
        })
        .eq("id", emailRecord.id);

      throw new Error(errorMessage);
    }

    console.log("Email sent successfully");

    // Update email status to sent
    const { error: updateError } = await supabase
      .from("emails")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", emailRecord.id);

    if (updateError) {
      console.error("Error updating email status:", updateError);
    }

    // Insert analytics record for sent event
    await supabase
      .from("email_analytics")
      .insert({
        email_id: emailRecord.id,
        event_type: "sent",
        event_data: {
          recipient: to,
          subject: subject,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        email_id: emailRecord.id,
        message: "Email sent successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to send email",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
