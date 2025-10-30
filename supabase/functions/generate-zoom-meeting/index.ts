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

    const { appointmentId, userId, title, startTime, duration } = await req.json();

    if (!appointmentId || !userId) {
      throw new Error('Missing required fields: appointmentId, userId');
    }

    // Get Zoom integration settings
    const { data: integration, error: intError } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('integration_type', 'zoom')
      .single();

    if (intError || !integration) {
      throw new Error('Zoom integration not configured. Please connect Zoom in Settings.');
    }

    const zoomCredentials = integration.api_credentials as any;
    if (!zoomCredentials?.access_token) {
      throw new Error('Zoom access token not found');
    }

    // Create Zoom meeting
    const meetingData = {
      topic: title || 'Meeting',
      type: 2, // Scheduled meeting
      start_time: startTime,
      duration: duration || 60,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        watermark: false,
        audio: 'voip',
        auto_recording: 'none'
      }
    };

    const zoomResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${zoomCredentials.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingData)
    });

    if (!zoomResponse.ok) {
      const error = await zoomResponse.text();
      console.error('Zoom API error:', error);
      throw new Error('Failed to create Zoom meeting');
    }

    const meeting = await zoomResponse.json();
    console.log('Zoom meeting created:', meeting);

    // Update appointment with Zoom meeting details
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        video_meeting_link: meeting.join_url,
        video_provider: 'zoom',
        video_meeting_data: {
          meeting_id: meeting.id,
          meeting_password: meeting.password,
          host_email: meeting.host_email,
          start_url: meeting.start_url
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
        meetingLink: meeting.join_url,
        meetingId: meeting.id,
        password: meeting.password
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-zoom-meeting:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
