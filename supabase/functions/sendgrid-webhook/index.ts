import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("SendGrid webhook called with method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const events = await req.json();
    console.log("Processing SendGrid webhook events:", events.length);

    for (const event of events) {
      const { event: eventType, timestamp, sg_event_id, sg_message_id } = event;
      
      // Get email_id from custom_args
      const email_id = event.email_id || event.unique_args?.email_id || event.custom_args?.email_id;
      
      console.log(`Processing ${eventType} event:`, {
        email_id,
        sg_event_id,
        sg_message_id,
        custom_args: event.custom_args,
        unique_args: event.unique_args
      });
      
      if (!email_id) {
        console.log("Skipping event without email_id:", eventType);
        continue;
      }

      // Handle special events that need custom logic
      switch (eventType) {
        case 'open':
          console.log("Processing email open event for email:", email_id);
          const { data: currentEmail } = await supabase
            .from('emails')
            .select('open_count, status')
            .eq('id', email_id)
            .single();
          
          if (currentEmail) {
            const newOpenCount = (currentEmail.open_count || 0) + 1;
            const newStatus = ['sent', 'delivered', 'processed'].includes(currentEmail.status) ? 'opened' : currentEmail.status;
            
            await supabase
              .from('emails')
              .update({ 
                open_count: newOpenCount,
                status: newStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', email_id);
            
            console.log(`Updated email ${email_id} open count to ${newOpenCount}`);
          }
          
          // Record analytics event
          await supabase
            .from('email_analytics')
            .insert({
              email_id: email_id,
              event_type: 'opened',
              event_data: event,
              user_agent: event.useragent,
              ip_address: event.ip,
              created_at: new Date(timestamp * 1000).toISOString()
            });
          continue;

        case 'click':
          console.log("Processing email click event for email:", email_id);
          const { data: currentEmailClick } = await supabase
            .from('emails')
            .select('click_count, status')
            .eq('id', email_id)
            .single();
          
          if (currentEmailClick) {
            const newClickCount = (currentEmailClick.click_count || 0) + 1;
            const newClickStatus = ['sent', 'delivered', 'processed', 'opened'].includes(currentEmailClick.status) ? 'clicked' : currentEmailClick.status;
            
            await supabase
              .from('emails')
              .update({ 
                click_count: newClickCount,
                status: newClickStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', email_id);
            
            console.log(`Updated email ${email_id} click count to ${newClickCount}`);
          }
          
          // Record analytics event
          await supabase
            .from('email_analytics')
            .insert({
              email_id: email_id,
              event_type: 'clicked',
              event_data: event,
              user_agent: event.useragent,
              ip_address: event.ip,
              created_at: new Date(timestamp * 1000).toISOString()
            });
          continue;
      }

      // Handle standard status updates with better reliability
      let updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Map SendGrid events to status with priority handling
      const statusPriority = {
        'queued': 1,
        'processed': 2, 
        'sent': 3,
        'delivered': 4,
        'opened': 5,
        'clicked': 6,
        'bounced': 7,
        'dropped': 7,
        'spam_reported': 7,
        'unsubscribed': 7,
        'deferred': 2,
        'failed': 7
      };

      let newStatus: string;
      switch (eventType) {
        case 'processed':
          newStatus = 'processed';
          break;
        case 'delivered':
          newStatus = 'delivered';
          break;
        case 'deferred':
          newStatus = 'deferred';
          break;
        case 'bounce':
          newStatus = 'bounced';
          updateData.bounce_reason = event.reason || 'Email bounced';
          break;
        case 'dropped':
          newStatus = 'dropped';
          updateData.bounce_reason = event.reason || 'Dropped by SendGrid (likely spam)';
          break;
        case 'spamreport':
          newStatus = 'spam_reported';
          break;
        case 'unsubscribe':
        case 'group_unsubscribe':
          newStatus = 'unsubscribed';
          break;
        default:
          console.log(`Unhandled event type: ${eventType}`);
          continue;
      }

      // Get current email status to check if update should proceed
      console.log(`Processing ${eventType} event for email ${email_id}`);
      
      const { data: currentEmail, error: fetchError } = await supabase
        .from('emails')
        .select('status')
        .eq('id', email_id)
        .single();

      if (fetchError) {
        console.error(`Failed to fetch current email status for ${email_id}:`, fetchError);
        // Still try to update even if fetch fails
      }

      // Only update if new status has higher or equal priority
      const currentPriority = currentEmail?.status ? statusPriority[currentEmail.status] || 0 : 0;
      const newPriority = statusPriority[newStatus] || 0;

      if (newPriority >= currentPriority) {
        updateData.status = newStatus;
        
        // Update email record with retry mechanism
        let updateAttempts = 0;
        const maxAttempts = 3;
        let updateSuccess = false;

        while (updateAttempts < maxAttempts && !updateSuccess) {
          updateAttempts++;
          console.log(`Attempting to update email ${email_id} status to ${newStatus} (attempt ${updateAttempts})`);
          
          const { error: updateError } = await supabase
            .from('emails')
            .update(updateData)
            .eq('id', email_id);

          if (updateError) {
            console.error(`Failed to update email ${email_id} (attempt ${updateAttempts}):`, updateError);
            if (updateAttempts < maxAttempts) {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * updateAttempts));
            }
          } else {
            updateSuccess = true;
            console.log(`Successfully updated email ${email_id} status to ${newStatus}`);
          }
        }

        if (!updateSuccess) {
          console.error(`Failed to update email ${email_id} after ${maxAttempts} attempts`);
        }
      } else {
        console.log(`Skipping status update for email ${email_id}: current status '${currentEmail?.status}' has higher priority than '${newStatus}'`);
      }

      // Always record analytics event regardless of status update success
      const { error: analyticsError } = await supabase
        .from('email_analytics')
        .insert({
          email_id: email_id,
          event_type: eventType,
          event_data: event,
          user_agent: event.useragent,
          ip_address: event.ip,
          created_at: new Date(timestamp * 1000).toISOString()
        });
      
      if (analyticsError) {
        console.error(`Failed to insert analytics for email ${email_id}:`, analyticsError);
      } else {
        console.log(`Recorded ${eventType} analytics for email ${email_id}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: events.length }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in sendgrid-webhook function:", error);
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