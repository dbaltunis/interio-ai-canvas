import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateNotesRequest {
  session_token: string;
  item_id: string;
  notes: string;
  share_link_token?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: UpdateNotesRequest = await req.json();
    const { session_token, item_id, notes, share_link_token } = body;

    console.log('📝 Update workshop notes request:', { 
      hasSessionToken: !!session_token, 
      itemId: item_id,
      notesLength: notes?.length,
      hasShareLinkToken: !!share_link_token
    });

    if (!session_token || !item_id) {
      return new Response(
        JSON.stringify({ error: 'Missing session_token or item_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate viewer session exists and has edit permission
    const { data: session, error: sessionError } = await supabase
      .from('work_order_shares')
      .select('id, project_id, permission_level, recipient_name, share_link_id')
      .eq('session_token', session_token)
      .eq('is_active', true)
      .maybeSingle();

    if (sessionError || !session) {
      console.error('❌ Session validation failed:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check permission level
    if (session.permission_level !== 'edit' && session.permission_level !== 'admin') {
      console.warn('⚠️ Insufficient permissions:', session.permission_level);
      return new Response(
        JSON.stringify({ error: 'You do not have permission to edit notes' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the item belongs to the session's project
    const { data: item, error: itemError } = await supabase
      .from('workshop_items')
      .select('id, project_id, notes')
      .eq('id', item_id)
      .maybeSingle();

    if (itemError || !item) {
      console.error('❌ Item not found:', itemError);
      return new Response(
        JSON.stringify({ error: 'Workshop item not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (item.project_id !== session.project_id) {
      console.error('❌ Item/session project mismatch');
      return new Response(
        JSON.stringify({ error: 'Item does not belong to this shared project' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the notes
    const { error: updateError } = await supabase
      .from('workshop_items')
      .update({ 
        notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', item_id);

    if (updateError) {
      console.error('❌ Failed to update notes:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save notes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Also sync to surfaces table if window_id exists
    const { data: workshopItem } = await supabase
      .from('workshop_items')
      .select('window_id')
      .eq('id', item_id)
      .maybeSingle();

    if (workshopItem?.window_id) {
      await supabase
        .from('surfaces')
        .update({ notes: notes })
        .eq('id', workshopItem.window_id);
    }

    // Update last accessed time on session
    await supabase
      .from('work_order_shares')
      .update({ 
        last_accessed_at: new Date().toISOString(),
        access_count: (session as any).access_count ? (session as any).access_count + 1 : 1
      })
      .eq('id', session.id);

    console.log('✅ Notes updated successfully by:', session.recipient_name);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notes saved successfully',
        updated_by: session.recipient_name 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
