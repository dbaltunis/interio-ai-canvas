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
  description: string; // TWC uses 'description' not 'itemName'
  productType?: string;
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    console.log('User authenticated:', user.id);

    const { products } = await req.json() as SyncRequest;

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No products provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Importing ${products.length} TWC products for user ${user.id}`);

    // Map category based on TWC product type with null safety
    const mapCategory = (productType: string | undefined | null): string => {
      if (!productType || typeof productType !== 'string') {
        console.warn('Invalid productType provided to mapCategory:', productType);
        return 'blinds_other';
      }
      
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
    const inventoryItems = products.map(product => {
      // Safe extraction of product type with multiple fallbacks
      let productType = 'Unknown Product';
      
      if (product.productType) {
        productType = product.productType;
      } else if (product.description) {
        // Try to extract from description (e.g., "Venetian Blinds (Item 1234)" -> "Venetian Blinds")
        const descParts = product.description.split('(');
        productType = descParts[0]?.trim() || product.description;
      }
      
      const productName = product.description || product.itemNumber || 'TWC Product';
      
      return {
        user_id: user.id,
        name: productName,
        sku: product.itemNumber || 'TWC-' + Date.now(),
        category: mapCategory(productType),
        subcategory: productType,
        supplier: 'TWC',
        active: true,
        show_in_quote: true,
        description: `${productType} - Imported from TWC`,
        metadata: {
          twc_item_number: product.itemNumber,
          twc_description: product.description,
          twc_product_type: productType,
          twc_questions: product.questions || [],
          twc_fabrics_and_colours: product.fabricsAndColours || [],
          imported_at: new Date().toISOString(),
        },
        // Default pricing - user can update later
        cost_price: 0,
        selling_price: 0,
      };
    });

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
