import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting email status checker...');
    
    // Find emails that might be stuck in intermediate statuses for more than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data: stuckEmails, error: fetchError } = await supabase
      .from('emails')
      .select('id, status, sent_at, updated_at')
      .in('status', ['queued', 'processed', 'sent'])
      .lt('updated_at', tenMinutesAgo)
      .not('sent_at', 'is', null);

    if (fetchError) {
      console.error('Error fetching stuck emails:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${stuckEmails?.length || 0} potentially stuck emails`);

    let updatedCount = 0;
    let checkedCount = 0;

    if (stuckEmails && stuckEmails.length > 0) {
      for (const email of stuckEmails) {
        checkedCount++;
        
        // Check if we have any analytics events for this email that indicate delivery
        const { data: analytics, error: analyticsError } = await supabase
          .from('email_analytics')
          .select('event_type, created_at')
          .eq('email_id', email.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (analyticsError) {
          console.error(`Error fetching analytics for email ${email.id}:`, analyticsError);
          continue;
        }

        // Find the highest priority status from analytics
        const statusPriority = {
          'queued': 1,
          'processed': 2, 
          'sent': 3,
          'delivered': 4,
          'opened': 5,
          'clicked': 6
        };

        let highestStatus = email.status;
        let highestPriority = statusPriority[email.status] || 0;

        if (analytics && analytics.length > 0) {
          for (const event of analytics) {
            const eventPriority = statusPriority[event.event_type] || 0;
            if (eventPriority > highestPriority) {
              highestPriority = eventPriority;
              highestStatus = event.event_type;
            }
          }

          // If we found a higher status in analytics, update the email
          if (highestStatus !== email.status) {
            console.log(`Updating stuck email ${email.id} from ${email.status} to ${highestStatus}`);
            
            const { error: updateError } = await supabase
              .from('emails')
              .update({
                status: highestStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', email.id);

            if (updateError) {
              console.error(`Error updating email ${email.id}:`, updateError);
            } else {
              updatedCount++;
              console.log(`Successfully updated email ${email.id} to ${highestStatus}`);
            }
          }
        } else {
          // If no analytics found but email is old, assume it was delivered
          const emailAge = Date.now() - new Date(email.sent_at).getTime();
          const oneHour = 60 * 60 * 1000;
          
          if (emailAge > oneHour && email.status === 'processed') {
            console.log(`Assuming old processed email ${email.id} was delivered`);
            
            const { error: updateError } = await supabase
              .from('emails')
              .update({
                status: 'delivered',
                updated_at: new Date().toISOString()
              })
              .eq('id', email.id);

            if (updateError) {
              console.error(`Error updating old email ${email.id}:`, updateError);
            } else {
              updatedCount++;
              console.log(`Successfully updated old email ${email.id} to delivered`);
            }
          }
        }
      }
    }

    const response = {
      success: true,
      checked: checkedCount,
      updated: updatedCount,
      timestamp: new Date().toISOString()
    };

    console.log('Email status checker completed:', response);

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in email status checker:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});