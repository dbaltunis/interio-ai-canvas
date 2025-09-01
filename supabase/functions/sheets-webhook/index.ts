import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const linkId = url.searchParams.get('linkId')
    
    if (!linkId) {
      throw new Error('linkId parameter required')
    }

    const { row_id, values } = await req.json()
    
    console.log(`Webhook received for link ${linkId}, row_id: ${row_id}`)

    // Get the sheet link
    const { data: sheetLink, error: linkError } = await supabase
      .from('crm_sheet_links')
      .select('*')
      .eq('id', linkId)
      .single()

    if (linkError || !sheetLink) {
      throw new Error('Sheet link not found')
    }

    const columnMap = sheetLink.column_map as Record<string, string>
    const recordData: any = {}
    
    // Map sheet values to database fields
    for (const [sheetColumn, value] of Object.entries(values)) {
      const dbField = columnMap[sheetColumn]
      
      if (dbField && value !== undefined && value !== null && value !== '') {
        if (dbField.includes('_eur')) {
          // Parse monetary fields
          const numValue = typeof value === 'string' ? 
            parseFloat(value.replace(/[€$,]/g, '')) : 
            parseFloat(value)
          recordData[dbField] = isNaN(numValue) ? 0 : numValue
        } else if (dbField === 'next_action_date') {
          // Parse date fields
          if (value) {
            recordData[dbField] = new Date(value).toISOString().split('T')[0]
          }
        } else {
          recordData[dbField] = value
        }
      }
    }

    if (Object.keys(recordData).length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No valid fields to update' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check for recent app updates (conflict resolution)
    if (row_id) {
      const { data: existingRecord } = await supabase
        .from('crm_accounts_v2')
        .select('*')
        .eq('row_id', row_id)
        .single()

      if (existingRecord) {
        const updatedAt = new Date(existingRecord.updated_at)
        const thirtySecondsAgo = new Date(Date.now() - 30000)
        
        // If updated by app in last 30 seconds, skip conflicting fields
        if (existingRecord.updated_source === 'app' && updatedAt > thirtySecondsAgo) {
          console.log('Recent app update detected, applying conflict resolution')
          
          // Remove all fields updated recently by app
          Object.keys(recordData).forEach(field => {
            if (field !== 'row_id') {
              delete recordData[field]
            }
          })
        }
        
        // Money fields always prefer app over sheet
        if (existingRecord.updated_source === 'app') {
          ['plugin_payments_eur', 'invoice_payments_eur', 'stripe_subs_eur'].forEach(field => {
            if (recordData[field] !== undefined) {
              delete recordData[field]
            }
          })
        }
      }
    }

    // If no valid updates after conflict resolution, return success
    if (Object.keys(recordData).filter(k => k !== 'row_id').length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No updates after conflict resolution' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Set metadata
    recordData.updated_source = 'sheet'
    recordData.updated_at = new Date().toISOString()
    
    // Use provided row_id or generate new one
    if (row_id) {
      recordData.row_id = row_id
    } else {
      recordData.row_id = crypto.randomUUID()
    }

    // Upsert the record
    const { data: upsertedAccount, error: upsertError } = await supabase
      .from('crm_accounts_v2')
      .upsert(recordData, { onConflict: 'row_id' })
      .select()
      .single()

    if (upsertError) {
      throw new Error(`Failed to upsert record: ${upsertError.message}`)
    }

    // Call mirror function if legacy_account_id exists
    if (upsertedAccount?.legacy_account_id) {
      try {
        await supabase.rpc('mirror_crm_v2_to_legacy', { 
          legacy_id: upsertedAccount.legacy_account_id 
        })
      } catch (error) {
        console.warn('Mirror function error (expected for stub):', error)
      }
    }

    console.log(`Successfully updated record ${recordData.row_id}`)

    return new Response(JSON.stringify({ 
      success: true, 
      row_id: recordData.row_id,
      updated_fields: Object.keys(recordData).filter(k => k !== 'row_id' && k !== 'updated_source' && k !== 'updated_at')
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in sheets-webhook:', error)
    return new Response(JSON.stringify({ 
      error: 'Webhook processing failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})