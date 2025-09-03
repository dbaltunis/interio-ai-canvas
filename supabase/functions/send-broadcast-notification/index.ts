import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BroadcastRequest {
  broadcastId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { broadcastId }: BroadcastRequest = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the broadcast notification
    const { data: broadcast, error: broadcastError } = await supabase
      .from('broadcast_notifications')
      .select('*')
      .eq('id', broadcastId)
      .single();

    if (broadcastError || !broadcast) {
      throw new Error('Broadcast notification not found');
    }

    // Update status to sending
    await supabase
      .from('broadcast_notifications')
      .update({ status: 'sending' })
      .eq('id', broadcastId);

    let recipients: string[] = [];
    let recipientEmails: string[] = [];
    let recipientPhones: string[] = [];

    // Get recipients based on type
    if (broadcast.recipient_type === 'all_clients') {
      const { data: clients } = await supabase
        .from('clients')
        .select('email, phone')
        .eq('user_id', broadcast.user_id)
        .not('email', 'is', null);
      
      if (clients) {
        recipientEmails = clients.filter(c => c.email).map(c => c.email);
        recipientPhones = clients.filter(c => c.phone).map(c => c.phone);
      }
    } else if (broadcast.recipient_type === 'team_members') {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, phone_number')
        .eq('parent_account_id', broadcast.user_id);
      
      if (profiles) {
        // Get emails from auth.users
        const userIds = profiles.map(p => p.user_id);
        const { data: users } = await supabase.auth.admin.listUsers();
        
        if (users?.users) {
          recipientEmails = users.users
            .filter(u => userIds.includes(u.id) && u.email)
            .map(u => u.email!);
        }
        
        recipientPhones = profiles.filter(p => p.phone_number).map(p => p.phone_number);
      }
    } else if (broadcast.recipient_type === 'selected_users') {
      recipients = broadcast.recipient_ids || [];
      // Get emails and phones for selected users
      const { data: users } = await supabase.auth.admin.listUsers();
      if (users?.users) {
        recipientEmails = users.users
          .filter(u => recipients.includes(u.id) && u.email)
          .map(u => u.email!);
      }
    }

    let successCount = 0;
    let failedCount = 0;
    const results = [];

    // Send email notifications
    if ((broadcast.type === 'email' || broadcast.type === 'both') && recipientEmails.length > 0) {
      for (const email of recipientEmails) {
        try {
          const { error } = await supabase.functions.invoke('send-client-email', {
            body: {
              to_email: email,
              subject: broadcast.title,
              message: broadcast.message,
              from_name: 'Notification System',
            }
          });

          if (error) {
            failedCount++;
            results.push({ email, status: 'failed', error: error.message });
          } else {
            successCount++;
            results.push({ email, status: 'sent' });
          }
        } catch (error) {
          failedCount++;
          results.push({ email, status: 'failed', error: error.message });
        }
      }
    }

    // Send SMS notifications
    if ((broadcast.type === 'sms' || broadcast.type === 'both') && recipientPhones.length > 0) {
      try {
        const { error } = await supabase.functions.invoke('send-bulk-sms', {
          body: {
            phoneNumbers: recipientPhones,
            message: `${broadcast.title}\n\n${broadcast.message}`,
            userId: broadcast.user_id,
          }
        });

        if (error) {
          failedCount += recipientPhones.length;
        } else {
          successCount += recipientPhones.length;
        }
      } catch (error) {
        failedCount += recipientPhones.length;
        console.error('SMS sending error:', error);
      }
    }

    // Update broadcast with final status
    const finalStatus = failedCount === 0 ? 'sent' : (successCount === 0 ? 'failed' : 'sent');
    await supabase
      .from('broadcast_notifications')
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
        recipients_count: recipientEmails.length + recipientPhones.length,
        success_count: successCount,
        failed_count: failedCount,
      })
      .eq('id', broadcastId);

    console.log(`Broadcast ${broadcastId} completed:`, {
      recipients_count: recipientEmails.length + recipientPhones.length,
      success_count: successCount,
      failed_count: failedCount,
    });

    return new Response(
      JSON.stringify({
        success: true,
        recipients_count: recipientEmails.length + recipientPhones.length,
        success_count: successCount,
        failed_count: failedCount,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-broadcast-notification:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);