
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
  message?: string;
  client_id?: string;
  user_id?: string;
  bookingId?: string;
  emailId?: string;
  attachmentPaths?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { to, subject, content, html, client_id, user_id, bookingId, emailId, message, attachmentPaths }: EmailRequest = requestBody;

    console.log("Processing email send request:", { to, subject, client_id, user_id, bookingId, emailId, attachments: attachmentPaths?.length || 0 });
    
    // Use html if provided, otherwise use content, then use message as fallback
    const emailContent = html || content || message;

    // Handle email record - either use existing or create new
    let emailData = null;
    if (emailId) {
      // If emailId is provided, fetch the existing record
      const { data, error: fetchError } = await supabase
        .from("emails")
        .select("*")
        .eq("id", emailId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching email record:", fetchError);
        throw new Error("Failed to fetch existing email record");
      }
      emailData = data;
      console.log("Using existing email record with ID:", emailData.id);
    } else if (user_id) {
      // Only create new record if no emailId provided
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
      console.log("Adding tracking to email content for email ID:", emailData.id);
      
      const trackingPixel = `<img src="${supabaseUrl}/functions/v1/track-email-open?id=${emailData.id}" width="1" height="1" style="display: none;" />`;
      
      // Convert plain text to HTML if needed and wrap links with tracking
      let processedContent = emailContent;
      
      // Check if content contains HTML tags
      const isHtml = /<[a-z][\s\S]*>/i.test(emailContent);
      
      if (!isHtml) {
        // Convert plain text to HTML, preserving line breaks
        processedContent = emailContent.replace(/\n/g, '<br>');
        // Wrap the content in basic HTML structure
        processedContent = `<html><body>${processedContent}</body></html>`;
      }
      
      // Wrap existing links with tracking URLs
      const contentWithTracking = processedContent.replace(
        /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>/gi,
        (match, url) => {
          const trackingUrl = `${supabaseUrl}/functions/v1/track-email-click?id=${emailData.id}&url=${encodeURIComponent(url)}`;
          return match.replace(url, trackingUrl);
        }
      );

      // Add tracking pixel to the end of the email content
      finalContent = contentWithTracking.replace('</body>', `${trackingPixel}</body>`);
      
      console.log("Enhanced email content with tracking");
      
      // Update the email record with the enhanced content
      await supabase
        .from("emails")
        .update({
          content: finalContent,
          updated_at: new Date().toISOString()
        })
        .eq("id", emailData.id);
    }

    // Get user's email settings or use defaults
    let fromEmail = "darius@curtainscalculator.com";
    let fromName = "Darius from Curtains Calculator";
    
    if (user_id) {
      const { data: emailSettings } = await supabase
        .from("email_settings")
        .select("from_email, from_name, active")
        .eq("user_id", user_id)
        .eq("active", true)
        .single();
      
      if (emailSettings?.from_email) {
        fromEmail = emailSettings.from_email;
        fromName = emailSettings.from_name || fromName;
        console.log("Using user email settings:", { fromEmail, fromName });
      }
    }

    // Get SendGrid API key
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendGridApiKey) {
      throw new Error("SENDGRID_API_KEY is not configured");
    }

    // Process attachments if any
    let attachments: any[] = [];
    if (attachmentPaths && attachmentPaths.length > 0) {
      console.log("Processing attachments:", attachmentPaths.length);
      
      for (const attachmentPath of attachmentPaths) {
        try {
          // Download file from Supabase storage
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('email-attachments')
            .download(attachmentPath);
          
          if (downloadError) {
            console.error("Error downloading attachment:", downloadError);
            continue; // Skip this attachment and continue with others
          }
          
          // Convert file to base64
          const arrayBuffer = await fileData.arrayBuffer();
          const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          // Get filename from path
          const filename = attachmentPath.split('/').pop() || 'attachment';
          
          // Get MIME type based on file extension
          const extension = filename.split('.').pop()?.toLowerCase() || '';
          const mimeTypes: Record<string, string> = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'txt': 'text/plain',
            'csv': 'text/csv'
          };
          
          const mimeType = mimeTypes[extension] || 'application/octet-stream';
          
          attachments.push({
            content: base64Content,
            filename: filename,
            type: mimeType,
            disposition: 'attachment'
          });
          
          console.log("Processed attachment:", filename, "Type:", mimeType);
        } catch (error) {
          console.error("Error processing attachment:", attachmentPath, error);
          // Continue with other attachments
        }
      }
      
      console.log("Successfully processed attachments:", attachments.length);
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
            custom_args: emailData ? {
              email_id: emailData.id,
              user_id: user_id || 'unknown'
            } : {}
          },
        ],
        from: {
          email: fromEmail,
          name: fromName,
        },
        content: [
          {
            type: "text/html",
            value: finalContent,
          },
        ],
        // Include attachments if any
        ...(attachments.length > 0 ? { attachments: attachments } : {}),
        tracking_settings: {
          click_tracking: {
            enable: true,
            enable_text: false
          },
          open_tracking: {
            enable: true,
            substitution_tag: "%open-track%"
          }
        }
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
