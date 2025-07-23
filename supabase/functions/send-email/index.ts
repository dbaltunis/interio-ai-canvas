
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  client_id?: string;
  from_email?: string;
  from_name?: string;
}

const wrapLinksForTracking = (content: string, emailId: string, baseUrl: string): string => {
  // Find all links in the content
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  
  return content.replace(linkRegex, (match, url, text) => {
    const trackingUrl = `${baseUrl}/functions/v1/track-email-click?id=${emailId}&url=${encodeURIComponent(url)}`;
    return match.replace(url, trackingUrl);
  });
};

const addTrackingPixel = (content: string, emailId: string, baseUrl: string): string => {
  const trackingPixelUrl = `${baseUrl}/functions/v1/track-email-open?id=${emailId}`;
  const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;">`;
  
  // Add tracking pixel before closing body tag, or at the end if no body tag
  if (content.includes('</body>')) {
    return content.replace('</body>', `${trackingPixel}</body>`);
  } else {
    return content + trackingPixel;
  }
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, content, client_id, from_email, from_name }: EmailRequest = await req.json();

    console.log("Sending email to:", to);

    // Get user's email settings
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data: emailSettings } = await supabase
      .from("email_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Get SendGrid API key
    const { data: integration } = await supabase
      .from("integration_settings")
      .select("*")
      .eq("user_id", user.id)
      .eq("integration_type", "sendgrid")
      .single();

    if (!integration?.api_credentials) {
      throw new Error("SendGrid integration not configured");
    }

    const sendGridApiKey = (integration.api_credentials as any)?.api_key;
    if (!sendGridApiKey) {
      throw new Error("SendGrid API key not found");
    }

    // Create email record first
    const { data: emailRecord, error: emailError } = await supabase
      .from("emails")
      .insert({
        user_id: user.id,
        client_id: client_id || null,
        recipient_email: to,
        subject,
        content,
        status: "queued"
      })
      .select()
      .single();

    if (emailError) {
      console.error("Error creating email record:", emailError);
      throw new Error("Failed to create email record");
    }

    // Wrap links for tracking and add tracking pixel
    const baseUrl = supabaseUrl.replace('/rest/v1', '');
    const contentWithTracking = wrapLinksForTracking(content, emailRecord.id, baseUrl);
    const contentWithPixel = addTrackingPixel(contentWithTracking, emailRecord.id, baseUrl);

    // Prepare email data
    const emailData = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: {
        email: from_email || emailSettings?.from_email || "noreply@example.com",
        name: from_name || emailSettings?.from_name || "Email System",
      },
      content: [
        {
          type: "text/html",
          value: contentWithPixel,
        },
      ],
    };

    // Add reply-to if configured
    if (emailSettings?.reply_to_email) {
      emailData.reply_to = {
        email: emailSettings.reply_to_email,
      };
    }

    // Send email via SendGrid
    const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendGridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error("SendGrid error:", errorText);
      
      // Update email status to failed
      await supabase
        .from("emails")
        .update({ 
          status: "failed",
          bounce_reason: errorText
        })
        .eq("id", emailRecord.id);

      throw new Error(`SendGrid error: ${errorText}`);
    }

    // Update email status to sent
    await supabase
      .from("emails")
      .update({ 
        status: "sent",
        sent_at: new Date().toISOString()
      })
      .eq("id", emailRecord.id);

    console.log("Email sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        email_id: emailRecord.id
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
        details: error.toString()
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
});
