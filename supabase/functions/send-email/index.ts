
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
      console.log("Adding enhanced tracking to email content for email ID:", emailData.id);
      
      // Create enhanced tracking pixel with JavaScript for advanced tracking
      const enhancedTrackingScript = `
        <script>
          (function() {
            const emailId = "${emailData.id}";
            const trackingBaseUrl = "${supabaseUrl}/functions/v1/track-email-enhanced";
            let startTime = Date.now();
            let isVisible = true;
            let totalTimeSpent = 0;
            
            // Track email open with device info
            const deviceInfo = {
              userAgent: navigator.userAgent,
              screenRes: screen.width + "x" + screen.height,
              platform: navigator.platform,
              language: navigator.language,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
            
            fetch(trackingBaseUrl + "?id=" + emailId + "&type=open&screen_resolution=" + deviceInfo.screenRes + "&platform=" + encodeURIComponent(deviceInfo.platform) + "&language=" + deviceInfo.language);
            
            // Track time spent more accurately
            function trackTimeSpent() {
              if (isVisible) {
                const sessionTime = Math.floor((Date.now() - startTime) / 1000);
                totalTimeSpent += sessionTime;
                if (sessionTime > 3) { // Track if viewed for more than 3 seconds
                  fetch(trackingBaseUrl + "?id=" + emailId + "&type=time_spent&time_spent=" + totalTimeSpent);
                }
              }
            }
            
            // Track visibility changes
            document.addEventListener('visibilitychange', function() {
              if (document.hidden) {
                isVisible = false;
                trackTimeSpent();
              } else {
                isVisible = true;
                startTime = Date.now();
                // Track re-open
                fetch(trackingBaseUrl + "?id=" + emailId + "&type=open&screen_resolution=" + deviceInfo.screenRes);
              }
            });
            
            // Track scrolling engagement
            let maxScroll = 0;
            window.addEventListener('scroll', function() {
              const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
              if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (scrollPercent > 50) { // Track significant engagement
                  fetch(trackingBaseUrl + "?id=" + emailId + "&type=engagement&scroll_percent=" + scrollPercent);
                }
              }
            });
            
            // Enhanced screenshot detection
            let screenshotAttempts = 0;
            
            // Keyboard shortcuts for screenshots
            document.addEventListener('keydown', function(e) {
              let isScreenshot = false;
              
              // Windows/Linux: Ctrl+Shift+S, Alt+PrintScreen, PrintScreen
              if ((e.ctrlKey && e.shiftKey && e.key === 'S') || 
                  (e.altKey && e.key === 'PrintScreen') || 
                  e.key === 'PrintScreen' || 
                  e.keyCode === 44) {
                isScreenshot = true;
              }
              
              // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
              if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
                isScreenshot = true;
              }
              
              if (isScreenshot) {
                screenshotAttempts++;
                fetch(trackingBaseUrl + "?id=" + emailId + "&type=screenshot&attempt=" + screenshotAttempts);
              }
            });
            
            // Mobile screenshot detection (volume down + power button simulation)
            let volumePressed = false;
            window.addEventListener('blur', function() {
              setTimeout(function() {
                if (document.hidden) {
                  screenshotAttempts++;
                  fetch(trackingBaseUrl + "?id=" + emailId + "&type=screenshot&mobile=true&attempt=" + screenshotAttempts);
                }
              }, 100);
            });
            
            // Track when user leaves
            window.addEventListener('beforeunload', function() {
              trackTimeSpent();
              fetch(trackingBaseUrl + "?id=" + emailId + "&type=session_end&total_time=" + totalTimeSpent);
            });
            
            // Periodic time tracking every 30 seconds
            setInterval(function() {
              if (isVisible) {
                trackTimeSpent();
                startTime = Date.now(); // Reset for next interval
              }
            }, 30000);
          })();
        </script>
      `;
      
      const trackingPixel = `<img src="${supabaseUrl}/functions/v1/track-email-enhanced?id=${emailData.id}&type=open" width="1" height="1" style="display: none;" />`;
      
      // Convert plain text to HTML if needed and wrap links with tracking
      let processedContent = emailContent;
      
      // Check if content contains HTML tags
      const isHtml = /<[a-z][\s\S]*>/i.test(emailContent);
      
      if (!isHtml) {
        // Convert plain text to HTML, preserving line breaks
        processedContent = emailContent.replace(/\n/g, '<br>');
        // Wrap the content in basic HTML structure
        processedContent = `<html><head>${enhancedTrackingScript}</head><body>${processedContent}</body></html>`;
      } else {
        // Insert tracking script into existing HTML
        if (processedContent.includes('</head>')) {
          processedContent = processedContent.replace('</head>', `${enhancedTrackingScript}</head>`);
        } else if (processedContent.includes('<body>')) {
          processedContent = processedContent.replace('<body>', `<body>${enhancedTrackingScript}`);
        } else {
          processedContent = `${enhancedTrackingScript}${processedContent}`;
        }
      }
      
      // Wrap existing links with tracking URLs
      const contentWithTracking = processedContent.replace(
        /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>/gi,
        (match, url) => {
          const trackingUrl = `${supabaseUrl}/functions/v1/track-email-enhanced?id=${emailData.id}&type=click&url=${encodeURIComponent(url)}`;
          return match.replace(url, trackingUrl);
        }
      );

      // Add tracking pixel to the end of the email content
      finalContent = contentWithTracking.replace('</body>', `${trackingPixel}</body>`);
      
      console.log("Enhanced email content with advanced tracking");
      
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
    console.log("Attachments to include:", attachments.length);
    if (attachments.length > 0) {
      console.log("Attachment details:", attachments.map(a => ({ filename: a.filename, type: a.type, size: a.content.length })));
    }

    // Build SendGrid payload with proper email authentication for deliverability
    const sendGridPayload = {
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
      reply_to: {
        email: fromEmail,
        name: fromName
      },
      content: [
        {
          type: "text/html",
          value: finalContent.replace(/\n/g, '<br>'),
        },
      ],
      // CRITICAL: Always include attachments array (empty or populated)
      attachments: attachments.length > 0 ? attachments : undefined,
      // Enhanced tracking and deliverability settings
      tracking_settings: {
        click_tracking: {
          enable: true,
          enable_text: false
        },
        open_tracking: {
          enable: true,
          substitution_tag: "%open-track%"
        },
        subscription_tracking: {
          enable: true,
          text: "If you'd like to unsubscribe and stop receiving these emails",
          html: "<p>If you'd like to unsubscribe and stop receiving these emails <a href=\"%unsubscribe%\">click here</a>.</p>"
        }
      },
      // Email authentication for better deliverability
      mail_settings: {
        spam_check: {
          enable: false  // Disable spam check to avoid post_to_url requirement
        },
        sandbox_mode: {
          enable: false
        }
      },
      // Add categories for better organization
      categories: ["business-email", "quotes"]
    };

    // Send email using SendGrid API
    const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendGridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendGridPayload),
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
