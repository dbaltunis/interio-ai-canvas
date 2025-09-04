import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProposalItem {
  id?: string
  job_id: string
  window_id: string
  title: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  png_visual?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { window_id, job_id } = await req.json()

    if (!window_id || !job_id) {
      return new Response(
        JSON.stringify({ error: 'window_id and job_id are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get window data
    const { data: window, error: windowError } = await supabaseClient
      .from('job_windows')
      .select(`
        *,
        product_templates (name)
      `)
      .eq('id', window_id)
      .single()

    if (windowError) throw windowError

    // Generate description from window state
    const state = window.state as any
    let description = `${window.product_templates?.name || 'Window Treatment'}`
    
    if (state?.measurements) {
      const { rail_width, drop } = state.measurements
      if (rail_width && drop) {
        description += ` - ${rail_width}mm × ${drop}mm`
      }
    }
    
    if (state?.selectedFabric?.name) {
      description += ` - ${state.selectedFabric.name}`
    }
    
    if (state?.selectedHardware?.length > 0) {
      description += ` - Hardware: ${state.selectedHardware.map((h: any) => h.name).join(', ')}`
    }

    // Check if proposal item already exists
    const { data: existingItem } = await supabaseClient
      .from('proposal_items')
      .select('*')
      .eq('window_id', window_id)
      .eq('job_id', job_id)
      .maybeSingle()

    const proposalItem: ProposalItem = {
      job_id,
      window_id,
      title: window.product_templates?.name || 'Window Treatment',
      description,
      quantity: 1,
      unit_price: window.price_total || 0,
      total_price: window.price_total || 0,
      png_visual: window.svg_snapshot
    }

    let result
    if (existingItem) {
      // Update existing proposal item
      const { data, error } = await supabaseClient
        .from('proposal_items')
        .update({
          title: proposalItem.title,
          description: proposalItem.description,
          unit_price: proposalItem.unit_price,
          total_price: proposalItem.total_price,
          png_visual: proposalItem.png_visual,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new proposal item
      const { data, error } = await supabaseClient
        .from('proposal_items')
        .insert(proposalItem)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        proposal_item: result,
        action: existingItem ? 'updated' : 'created'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to add window to quote', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})