import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

interface TrackingEvent {
  emailId: string;
  eventType: 'open' | 'click' | 'download' | 'screenshot' | 'time_spent';
  eventData?: any;
  userAgent?: string;
  ipAddress?: string;
}

serve(async (req: Request) => {
  console.log("=== ENHANCED EMAIL TRACKING REQUEST ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const emailId = url.searchParams.get("id");
    const eventType = url.searchParams.get("type") || "open";
    const targetUrl = url.searchParams.get("url");
    const attachmentName = url.searchParams.get("attachment");
    const timeSpent = url.searchParams.get("time_spent");

    console.log("Tracking event:", { emailId, eventType, targetUrl, attachmentName, timeSpent });

    if (!emailId) {
      console.error("Missing email ID");
      return handleResponse(eventType as any, null);
    }

    const userAgent = req.headers.get("user-agent") || "unknown";
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Track the event
    await trackEvent({
      emailId,
      eventType: eventType as any,
      eventData: {
        timestamp: new Date().toISOString(),
        targetUrl,
        attachmentName,
        timeSpent: timeSpent ? parseInt(timeSpent) : undefined,
        referrer: req.headers.get("referer"),
        screenResolution: url.searchParams.get("screen_resolution"),
      },
      userAgent,
      ipAddress,
    });

    return handleResponse(eventType as any, targetUrl);
  } catch (error) {
    console.error("Error in enhanced tracking:", error);
    return returnTrackingPixel();
  }
});

async function trackEvent(event: TrackingEvent) {
  const { emailId, eventType, eventData, userAgent, ipAddress } = event;

  try {
    // Get current email data
    const { data: emailData, error: fetchError } = await supabase
      .from("emails")
      .select("open_count, click_count, time_spent_seconds, status")
      .eq("id", emailId)
      .single();

    if (fetchError) {
      console.error("Error fetching email:", fetchError);
      return;
    }

    // Update counters based on event type
    let updateData: any = {
      updated_at: new Date().toISOString()
    };

    switch (eventType) {
      case 'open':
        updateData.open_count = (emailData.open_count || 0) + 1;
        // Update status to 'opened' if it was 'sent' or 'delivered'
        if (['sent', 'delivered'].includes(emailData.status)) {
          updateData.status = 'opened';
        }
        break;
      
      case 'click':
        updateData.click_count = (emailData.click_count || 0) + 1;
        updateData.status = 'clicked';
        break;
      
      case 'time_spent':
        if (eventData.timeSpent) {
          updateData.time_spent_seconds = (emailData.time_spent_seconds || 0) + eventData.timeSpent;
        }
        break;
    }

    // Update email record
    const { error: updateError } = await supabase
      .from("emails")
      .update(updateData)
      .eq("id", emailId);

    if (updateError) {
      console.error("Error updating email:", updateError);
    } else {
      console.log("Successfully updated email:", updateData);
    }

    // Insert analytics record - use consistent event type "open" (not "opened")
    const analyticsEventType = eventType === 'open' ? 'open' : eventType;
    
    const { error: analyticsError } = await supabase
      .from("email_analytics")
      .insert({
        email_id: emailId,
        event_type: analyticsEventType,
        ip_address: ipAddress,
        user_agent: userAgent,
        event_data: eventData
      });

    if (analyticsError) {
      console.error("Error inserting analytics:", analyticsError);
    } else {
      console.log("Successfully inserted analytics record for:", analyticsEventType);
    }

  } catch (error) {
    console.error("Error tracking event:", error);
  }
}

function handleResponse(eventType: string, targetUrl?: string | null) {
  switch (eventType) {
    case 'click':
      if (targetUrl) {
        return redirectToUrl(targetUrl);
      }
      return returnTrackingPixel();
    
    case 'download':
      // For downloads, we'll redirect to the attachment URL
      if (targetUrl) {
        return redirectToUrl(targetUrl);
      }
      return new Response("Download not found", { status: 404 });
    
    case 'screenshot':
      // For screenshot detection, just return success
      return new Response(JSON.stringify({ tracked: true }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    
    default:
      return returnTrackingPixel();
  }
}

function redirectToUrl(targetUrl: string) {
  return new Response(null, {
    status: 302,
    headers: {
      "Location": targetUrl,
      ...corsHeaders,
    },
  });
}

function returnTrackingPixel() {
  // Return a 1x1 transparent pixel
  const pixelData = new Uint8Array([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
    0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3b
  ]);

  return new Response(pixelData, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      ...corsHeaders,
    },
  });
}