import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TWCQuestion {
  question: string;
  questionType: string;
  answers: string[];
}

interface TWCFabricColor {
  fabricOrColourName: string;
  fabricOrColourCode?: string;
}

interface TWCProduct {
  itemNumber: string;
  itemName: string;
  productType: string;
  questions?: TWCQuestion[];
  fabricsAndColours?: TWCFabricColor[];
}

interface SyncRequest {
  products: TWCProduct[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { products } = await req.json() as SyncRequest;

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No products provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Importing ${products.length} TWC products for user ${user.id}`);

    // Map category based on TWC product type
    const mapCategory = (productType: string): string => {
      const lowerType = productType.toLowerCase();
      if (lowerType.includes('venetian')) return 'blinds_venetian';
      if (lowerType.includes('roller')) return 'blinds_roller';
      if (lowerType.includes('vertical')) return 'blinds_vertical';
      if (lowerType.includes('cellular') || lowerType.includes('honeycomb')) return 'blinds_cellular';
      if (lowerType.includes('roman')) return 'roman_blinds';
      if (lowerType.includes('shutter')) return 'shutters';
      if (lowerType.includes('awning')) return 'awnings';
      return 'blinds_other';
    };

    // Prepare inventory items for batch insert
    const inventoryItems = products.map(product => ({
      user_id: user.id,
      name: product.itemName,
      sku: product.itemNumber,
      category: mapCategory(product.productType),
      subcategory: product.productType,
      supplier: 'TWC',
      active: true,
      show_in_quote: true,
      description: `${product.productType} - Imported from TWC`,
      metadata: {
        twc_item_number: product.itemNumber,
        twc_item_name: product.itemName,
        twc_product_type: product.productType,
        twc_questions: product.questions || [],
        twc_fabrics_and_colours: product.fabricsAndColours || [],
        imported_at: new Date().toISOString(),
      },
      // Default pricing - user can update later
      cost_price: 0,
      selling_price: 0,
    }));

    // Batch insert products
    const { data: insertedItems, error: insertError } = await supabaseClient
      .from('enhanced_inventory_items')
      .insert(inventoryItems)
      .select();

    if (insertError) {
      console.error('Error inserting TWC products:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to import products',
          details: insertError.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Successfully imported ${insertedItems?.length || 0} TWC products`);

    return new Response(
      JSON.stringify({ 
        success: true,
        imported: insertedItems?.length || 0,
        products: insertedItems,
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in twc-sync-products:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
