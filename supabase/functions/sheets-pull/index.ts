import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SheetData {
  headers: string[];
  rows: any[][];
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

async function readSheetByUrl(sheetUrl: string, tabName: string): Promise<SheetData> {
  const accessToken = await getGoogleSheetsAuth();
  
  // Extract sheet ID from URL
  const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!sheetIdMatch) {
    throw new Error('Invalid sheet URL');
  }
  const sheetId = sheetIdMatch[1];
  
  // Read the sheet data
  const range = `${tabName}!A:Z`; // Read all data
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
  
  if (values.length === 0) {
    return { headers: [], rows: [] };
  }
  
  return {
    headers: values[0] || [],
    rows: values.slice(1) || []
  };
}

async function writeSheetBatch(sheetUrl: string, tabName: string, rows: any[][]): Promise<void> {
  const accessToken = await getGoogleSheetsAuth();
  
  // Extract sheet ID from URL
  const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!sheetIdMatch) {
    throw new Error('Invalid sheet URL');
  }
  const sheetId = sheetIdMatch[1];
  
  if (rows.length === 0) return;
  
  // Batch update the rows
  const range = `${tabName}!A2:Z${rows.length + 1}`; // Start from row 2 (skip header)
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows
      }),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to write sheet: ${await response.text()}`);
  }
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

    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { linkId } = await req.json()
    
    console.log(`Pulling from sheet for link: ${linkId}`)

    // Get the sheet link
    const { data: sheetLink, error: linkError } = await supabase
      .from('crm_sheet_links')
      .select('*')
      .eq('id', linkId)
      .single()

    if (linkError || !sheetLink) {
      throw new Error('Sheet link not found')
    }

    // Read data from Google Sheet
    const sheetData = await readSheetByUrl(sheetLink.sheet_url, sheetLink.tab_name)
    console.log(`Read ${sheetData.rows.length} rows from sheet`)

    let updatedRows = 0
    const columnMap = sheetLink.column_map as Record<string, string>

    // Process each row
    for (const row of sheetData.rows) {
      if (!row || row.length === 0) continue

      // Map sheet columns to database fields
      const recordData: any = {}
      let hasRowId = false
      
      for (let i = 0; i < sheetData.headers.length; i++) {
        const sheetColumn = sheetData.headers[i]
        const dbField = columnMap[sheetColumn]
        
        if (dbField && row[i] !== undefined && row[i] !== null && row[i] !== '') {
          if (dbField === 'row_id') {
            recordData.row_id = row[i]
            hasRowId = true
          } else if (dbField.includes('_eur')) {
            // Parse monetary fields
            const value = typeof row[i] === 'string' ? 
              parseFloat(row[i].replace(/[€$,]/g, '')) : 
              parseFloat(row[i])
            recordData[dbField] = isNaN(value) ? 0 : value
          } else if (dbField === 'next_action_date') {
            // Parse date fields
            if (row[i]) {
              recordData[dbField] = new Date(row[i]).toISOString().split('T')[0]
            }
          } else {
            recordData[dbField] = row[i]
          }
        }
      }

      if (Object.keys(recordData).length === 0) continue

      // Generate row_id if not present
      if (!hasRowId) {
        recordData.row_id = crypto.randomUUID()
      }

      // Set metadata
      recordData.updated_source = 'sheet'
      recordData.updated_at = new Date().toISOString()

      // Upsert into crm_accounts_v2
      const { data: upsertedAccount, error: upsertError } = await supabase
        .from('crm_accounts_v2')
        .upsert(recordData, { onConflict: 'row_id' })
        .select()
        .single()

      if (upsertError) {
        console.error('Error upserting account:', upsertError)
        continue
      }

      updatedRows++

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
    }

    console.log(`Successfully updated ${updatedRows} rows`)

    return new Response(JSON.stringify({ 
      success: true, 
      updatedRows,
      totalRows: sheetData.rows.length 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in sheets-pull:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to pull from sheet',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})