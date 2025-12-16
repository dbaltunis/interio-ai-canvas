import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-key',
};

// Rachel's account ID for Homekaara
const RACHEL_USER_ID = '708d8e36-8fa3-4e07-b43b-c0a90941f991';

interface FabricRow {
  sku: string;
  name: string;
  cost_price: number;
  selling_price: number;
  fabric_width: number;
  repeat: string;
  composition: string;
  colors: string[];
  image_url?: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(csvContent: string): FabricRow[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  console.log('CSV Headers:', headers);
  
  // Map headers to expected fields
  const headerMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    if (h.includes('item code') || h === 'sku') headerMap['sku'] = i;
    if (h === 'item' || h === 'name' || h === 'fabric name') headerMap['name'] = i;
    if (h.includes('cost')) headerMap['cost_price'] = i;
    if (h.includes('selling') || h === 'price') headerMap['selling_price'] = i;
    if (h.includes('width')) headerMap['fabric_width'] = i;
    if (h === 'repeat') headerMap['repeat'] = i;
    if (h === 'type' || h === 'composition' || h === 'material') headerMap['composition'] = i;
    if (h === 'color' || h === 'colours' || h === 'colors') headerMap['colors'] = i;
    if (h.includes('image') || h === 'url') headerMap['image_url'] = i;
  });
  
  console.log('Header mapping:', headerMap);
  
  const fabrics: FabricRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 3) continue;
    
    const sku = headerMap['sku'] !== undefined ? values[headerMap['sku']] : '';
    const name = headerMap['name'] !== undefined ? values[headerMap['name']] : '';
    
    if (!name) continue;
    
    const costStr = headerMap['cost_price'] !== undefined ? values[headerMap['cost_price']] : '0';
    const sellStr = headerMap['selling_price'] !== undefined ? values[headerMap['selling_price']] : '0';
    const widthStr = headerMap['fabric_width'] !== undefined ? values[headerMap['fabric_width']] : '137';
    
    const cost_price = parseFloat(costStr.replace(/[^\d.]/g, '')) || 0;
    const selling_price = parseFloat(sellStr.replace(/[^\d.]/g, '')) || 0;
    const fabric_width = parseFloat(widthStr.replace(/[^\d.]/g, '')) || 137;
    
    const repeat = headerMap['repeat'] !== undefined ? values[headerMap['repeat']] : '';
    const composition = headerMap['composition'] !== undefined ? values[headerMap['composition']] : '';
    const colorsStr = headerMap['colors'] !== undefined ? values[headerMap['colors']] : '';
    const image_url = headerMap['image_url'] !== undefined ? values[headerMap['image_url']] : '';
    
    // Parse colors - split by comma
    const colors = colorsStr
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);
    
    fabrics.push({
      sku: sku || `HK-${name.replace(/\s+/g, '-').toUpperCase().substring(0, 20)}`,
      name,
      cost_price,
      selling_price,
      fabric_width,
      repeat,
      composition,
      colors,
      image_url: image_url && !image_url.includes('placeholder') ? image_url : undefined,
    });
  }
  
  return fabrics;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin key
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== 'homekaara-setup-2024') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { csvContent, dryRun = false } = await req.json();
    
    if (!csvContent) {
      return new Response(JSON.stringify({ error: 'CSV content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Parsing CSV...');
    const fabrics = parseCSV(csvContent);
    console.log(`Parsed ${fabrics.length} fabrics from CSV`);

    if (dryRun) {
      // Return preview without importing
      return new Response(JSON.stringify({
        success: true,
        dryRun: true,
        totalFabrics: fabrics.length,
        preview: fabrics.slice(0, 10),
        colorStats: {
          totalColors: fabrics.reduce((sum, f) => sum + f.colors.length, 0),
          avgColorsPerFabric: (fabrics.reduce((sum, f) => sum + f.colors.length, 0) / fabrics.length).toFixed(1),
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Import fabrics to inventory
    const results = {
      created: 0,
      errors: [] as string[],
    };

    for (const fabric of fabrics) {
      try {
        const { error } = await supabase
          .from('enhanced_inventory_items')
          .insert({
            user_id: RACHEL_USER_ID,
            name: fabric.name,
            sku: fabric.sku,
            description: fabric.composition || `${fabric.name} fabric`,
            category: 'fabric',
            subcategory: 'curtain_fabric',
            item_type: 'fabric',
            cost_price: fabric.cost_price,
            selling_price: fabric.selling_price,
            fabric_width: fabric.fabric_width,
            pricing_method: 'per_linear_meter',
            price_per_meter: fabric.selling_price,
            track_inventory: false,
            active: true,
            image_url: fabric.image_url,
            tags: fabric.colors,
            metadata: {
              composition: fabric.composition,
              repeat: fabric.repeat,
              colors: fabric.colors,
              source: 'homekaara_import',
              imported_at: new Date().toISOString(),
            },
          });

        if (error) {
          console.error(`Error importing ${fabric.name}:`, error);
          results.errors.push(`${fabric.name}: ${error.message}`);
        } else {
          results.created++;
        }
      } catch (err) {
        console.error(`Exception importing ${fabric.name}:`, err);
        results.errors.push(`${fabric.name}: ${err.message}`);
      }
    }

    console.log(`Import complete: ${results.created} created, ${results.errors.length} errors`);

    return new Response(JSON.stringify({
      success: true,
      results: {
        totalParsed: fabrics.length,
        created: results.created,
        errors: results.errors.slice(0, 20), // Limit error output
        errorCount: results.errors.length,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Import error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
