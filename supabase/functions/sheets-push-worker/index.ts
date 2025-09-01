import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getGoogleSheetsAuth() {
  const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
  if (!serviceAccountJson) {
    throw new Error('Google Service Account JSON not configured');
  }
  
  const serviceAccount = JSON.parse(serviceAccountJson);
  
  // Create JWT for Google Service Account
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: serviceAccount.private_key_id
  };
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };
  
  // Import the private key
  const privateKeyPem = serviceAccount.private_key;
  const privateKeyFormatted = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  
  const privateKeyBinary = Uint8Array.from(atob(privateKeyFormatted), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBinary,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );
  
  // Create the JWT
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsignedToken)
  );
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${unsignedToken}.${signatureB64}`;
  
  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  
  if (!tokenResponse.ok) {
    throw new Error(`Failed to get access token: ${await tokenResponse.text()}`);
  }
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function updateSheetRow(sheetUrl: string, tabName: string, rowData: any[], rowIndex: number): Promise<void> {
  const accessToken = await getGoogleSheetsAuth();
  
  // Extract sheet ID from URL
  const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!sheetIdMatch) {
    throw new Error('Invalid sheet URL');
  }
  const sheetId = sheetIdMatch[1];
  
  // Update specific row
  const range = `${tabName}!A${rowIndex + 2}:Z${rowIndex + 2}`; // +2 because rows are 1-indexed and we skip header
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData]
      }),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to update sheet row: ${await response.text()}`);
  }
}

async function findRowByRowId(sheetUrl: string, tabName: string, rowId: string): Promise<number | null> {
  const accessToken = await getGoogleSheetsAuth();
  
  // Extract sheet ID from URL
  const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!sheetIdMatch) {
    throw new Error('Invalid sheet URL');
  }
  const sheetId = sheetIdMatch[1];
  
  // Read all data to find the row
  const range = `${tabName}!A:Z`;
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to read sheet: ${await response.text()}`);
  }
  
  const data = await response.json();
  const values = data.values || [];
  
  if (values.length === 0) return null;
  
  const headers = values[0];
  const rowIdColumnIndex = headers.findIndex((h: string) => h === 'row_id');
  
  if (rowIdColumnIndex === -1) return null;
  
  // Find the row with matching row_id
  for (let i = 1; i < values.length; i++) {
    if (values[i][rowIdColumnIndex] === rowId) {
      return i - 1; // Return 0-based index relative to data rows (excluding header)
    }
  }
  
  return null;
}

// This function runs as a worker to process the push queue
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Processing push queue...')

    // Get pending push jobs (up to 100 for batch processing)
    const { data: pushJobs, error: jobsError } = await supabase
      .from('crm_push_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('next_run_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(100)

    if (jobsError) {
      throw new Error(`Failed to fetch push jobs: ${jobsError.message}`)
    }

    if (!pushJobs || pushJobs.length === 0) {
      console.log('No pending push jobs')
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No pending jobs',
        processed: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${pushJobs.length} pending push jobs`)

    let processed = 0
    let failed = 0

    // Group jobs by sheet link to batch process
    const jobsByLink = new Map<string, any[]>()
    
    for (const job of pushJobs) {
      // Mark as processing
      await supabase
        .from('crm_push_queue')
        .update({ status: 'processing' })
        .eq('id', job.id)

      // Get the CRM record
      const { data: crmRecord, error: recordError } = await supabase
        .from('crm_accounts_v2')
        .select('*')
        .eq('row_id', job.row_id)
        .single()

      if (recordError || !crmRecord) {
        console.error(`Failed to fetch CRM record for ${job.row_id}:`, recordError)
        
        // Mark job as failed
        await supabase
          .from('crm_push_queue')
          .update({ 
            status: 'failed',
            error_message: 'CRM record not found',
            attempt: job.attempt + 1
          })
          .eq('id', job.id)
        
        failed++
        continue
      }

      // Get all active sheet links for this account
      const { data: sheetLinks, error: linksError } = await supabase
        .from('crm_sheet_links')
        .select('*')
        .eq('is_two_way', true)

      if (linksError || !sheetLinks || sheetLinks.length === 0) {
        console.log('No active two-way sheet links found')
        
        // Mark job as completed (no action needed)
        await supabase
          .from('crm_push_queue')
          .update({ status: 'completed' })
          .eq('id', job.id)
        
        processed++
        continue
      }

      // Process each sheet link
      for (const sheetLink of sheetLinks) {
        try {
          const columnMap = sheetLink.column_map as Record<string, string>
          
          // Build row data for sheet
          const sheetRowData: any[] = []
          const reverseColumnMap = Object.fromEntries(
            Object.entries(columnMap).map(([sheetCol, dbField]) => [dbField, sheetCol])
          )
          
          // Get headers from the reverse map to maintain order
          const sheetHeaders = Object.keys(columnMap)
          
          for (const header of sheetHeaders) {
            const dbField = columnMap[header]
            let value = crmRecord[dbField]
            
            // Format values for sheet
            if (dbField && dbField.includes('_eur') && typeof value === 'number') {
              value = `€${value.toFixed(2)}`
            } else if (dbField === 'next_action_date' && value) {
              value = new Date(value).toLocaleDateString()
            }
            
            sheetRowData.push(value || '')
          }

          // Find the row in the sheet by row_id
          const rowIndex = await findRowByRowId(sheetLink.sheet_url, sheetLink.tab_name, crmRecord.row_id)
          
          if (rowIndex !== null) {
            // Update existing row
            await updateSheetRow(sheetLink.sheet_url, sheetLink.tab_name, sheetRowData, rowIndex)
            console.log(`Updated row ${rowIndex} in sheet for record ${crmRecord.row_id}`)
          } else {
            // TODO: Handle new row creation - would need to append to sheet
            console.log(`Row not found in sheet for record ${crmRecord.row_id}, skipping`)
          }

        } catch (error) {
          console.error(`Failed to push to sheet ${sheetLink.id}:`, error)
          
          // Update job with error but don't fail it completely if other sheets worked
          await supabase
            .from('crm_push_queue')
            .update({ 
              error_message: `Sheet update failed: ${error.message}`,
              attempt: job.attempt + 1
            })
            .eq('id', job.id)
        }
      }

      // Mark job as completed
      await supabase
        .from('crm_push_queue')
        .update({ status: 'completed' })
        .eq('id', job.id)
      
      processed++
    }

    console.log(`Processed ${processed} jobs, ${failed} failed`)

    return new Response(JSON.stringify({ 
      success: true, 
      processed,
      failed,
      total: pushJobs.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in sheets-push-worker:', error)
    return new Response(JSON.stringify({ 
      error: 'Push worker failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})