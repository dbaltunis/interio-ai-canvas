import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { feedbackType, featureArea, description, conversationContext } = await req.json();

    if (!feedbackType || !description) {
      throw new Error('Missing required fields: feedbackType and description');
    }

    console.log('Submitting feedback from user:', user.email);

    // Insert feedback into database
    const { data: feedback, error: insertError } = await supabase
      .from('user_feedback')
      .insert({
        user_id: user.id,
        user_email: user.email,
        feedback_type: feedbackType,
        feature_area: featureArea || null,
        description: description,
        conversation_context: conversationContext || {},
        status: 'new',
        priority: feedbackType === 'bug' ? 'high' : 'medium',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting feedback:', insertError);
      throw insertError;
    }

    console.log('Feedback submitted successfully:', feedback.id);

    // Create a notification for the user
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Feedback Received',
        message: 'Thank you! Your feedback has been sent to Darius. He reviews all feedback personally.',
        type: 'success',
      });

    return new Response(JSON.stringify({
      success: true,
      feedbackId: feedback.id,
      message: 'Feedback submitted successfully. Darius will review it soon!',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
