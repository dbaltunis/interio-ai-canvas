import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { appointmentId, userId, title, startTime, endTime } = await req.json();

    if (!appointmentId || !userId) {
      throw new Error('Missing required fields: appointmentId, userId');
    }

    // Get Teams integration settings
    const { data: integration, error: intError } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('integration_type', 'microsoft_teams')
      .single();

    if (intError || !integration) {
      throw new Error('Microsoft Teams integration not configured. Please connect Teams in Settings.');
    }

    const teamsCredentials = integration.api_credentials as any;
    if (!teamsCredentials?.access_token) {
      throw new Error('Teams access token not found');
    }

    // Create Teams online meeting
    const meetingData = {
      subject: title || 'Meeting',
      startDateTime: startTime,
      endDateTime: endTime,
      participants: {
        organizer: {
          identity: {
            user: {
              id: teamsCredentials.user_id
            }
          }
        }
      }
    };

    const teamsResponse = await fetch('https://graph.microsoft.com/v1.0/me/onlineMeetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teamsCredentials.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingData)
    });

    if (!teamsResponse.ok) {
      const error = await teamsResponse.text();
      console.error('Teams API error:', error);
      throw new Error('Failed to create Teams meeting');
    }

    const meeting = await teamsResponse.json();
    console.log('Teams meeting created:', meeting);

    // Update appointment with Teams meeting details
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        video_meeting_link: meeting.joinUrl,
        video_provider: 'teams',
        video_meeting_data: {
          meeting_id: meeting.id,
          join_web_url: meeting.joinWebUrl,
          conference_id: meeting.audioConferencing?.conferenceId,
          toll_number: meeting.audioConferencing?.tollNumber
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        meetingLink: meeting.joinUrl,
        meetingId: meeting.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-teams-meeting:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
