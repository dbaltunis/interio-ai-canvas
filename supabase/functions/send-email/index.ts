
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
  content?: string;
  html?: string;
  client_id?: string;
  user_id?: string;
  bookingId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, content, html, client_id, user_id, bookingId }: EmailRequest = await req.json();

    console.log("Processing email send request:", { to, subject, client_id, user_id, bookingId });
    
    // Use html if provided, otherwise use content
    const emailContent = html || content;

    // First, save the email to database (only if user_id is provided)
    let emailData = null;
    if (user_id) {
      const { data, error: insertError } = await supabase
        .from("emails")
        .insert({
          user_id,
          client_id,
          recipient_email: to,
          subject,
          content: emailContent,
          status: 'queued'
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error saving email to database:", insertError);
        throw new Error("Failed to save email to database");
      }
      emailData = data;
      console.log("Email saved to database with ID:", emailData.id);
    }

    // Add tracking pixel and wrap links only if we have an emailData record
    let finalContent = emailContent;
    if (emailData) {
      const trackingPixel = `<img src="${supabaseUrl}/functions/v1/track-email-open?id=${emailData.id}" width="1" height="1" style="display: none;" />`;
      
      // Wrap links with tracking
      const contentWithTracking = emailContent.replace(
        /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>/gi,
        (match, url) => {
          const trackingUrl = `${supabaseUrl}/functions/v1/track-email-click?id=${emailData.id}&url=${encodeURIComponent(url)}`;
          return match.replace(url, trackingUrl);
        }
      );

      finalContent = contentWithTracking + trackingPixel;
    }

    // Get SendGrid API key
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendGridApiKey) {
      throw new Error("SENDGRID_API_KEY is not configured");
    }

    console.log("Sending email via SendGrid...");

    // Send email using SendGrid API
    const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendGridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject,
          },
        ],
        from: {
          email: "darius@curtainscalculator.com",
          name: "Darius from Curtains Calculator",
        },
        content: [
          {
            type: "text/html",
            value: finalContent,
          },
        ],
      }),
    });

    console.log("SendGrid response status:", sendGridResponse.status);

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error("SendGrid error response:", errorText);
      
      // Update email status to failed (only if we have emailData)
      if (emailData) {
        await supabase
          .from("emails")
          .update({
            status: 'failed',
            bounce_reason: errorText,
            updated_at: new Date().toISOString()
          })
          .eq("id", emailData.id);
      }

      throw new Error(`SendGrid API error: ${sendGridResponse.status} - ${errorText}`);
    }

    console.log("Email sent successfully via SendGrid");

    // Update email status to sent (only if we have emailData)
    if (emailData) {
      const { error: updateError } = await supabase
        .from("emails")
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", emailData.id);

      if (updateError) {
        console.error("Error updating email status:", updateError);
      }
    }

    // If this is for a booking confirmation, update the booking status
    if (bookingId) {
      const { error: bookingError } = await supabase
        .from('appointments_booked')
        .update({ 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (bookingError) {
        console.error('Error updating booking status:', bookingError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        email_id: emailData?.id,
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
        success: false,
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
