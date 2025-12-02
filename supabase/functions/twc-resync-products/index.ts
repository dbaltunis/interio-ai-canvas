import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's account_id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id, parent_account_id')
      .eq('user_id', user.id)
      .single();

    const accountId = profile?.parent_account_id || user.id;
    console.log('Re-syncing TWC products for account:', accountId);

    // Fetch all TWC inventory items with metadata
    const { data: twcItems, error: itemsError } = await supabase
      .from('enhanced_inventory_items')
      .select('id, name, category, metadata')
      .eq('user_id', accountId)
      .not('metadata->twc_item_number', 'is', null);

    if (itemsError) {
      console.error('Error fetching TWC items:', itemsError);
      throw itemsError;
    }

    console.log(`Found ${twcItems?.length || 0} TWC inventory items`);

    // Extract unique questions from all TWC items
    const uniqueQuestions = new Map<string, {
      key: string;
      label: string;
      options: string[];
      isRequired: boolean;
      treatmentCategory: string;
    }>();

    for (const item of twcItems || []) {
      const questions = item.metadata?.twc_questions || [];
      const treatmentCategory = mapCategoryToTreatment(item.category);
      
      for (const q of questions) {
        // Use the question name as the key
        const key = generateKey(q.name);
        
        // Skip questions with no options
        if (!q.options || q.options.length === 0) continue;
        
        if (!uniqueQuestions.has(key)) {
          uniqueQuestions.set(key, {
            key,
            label: q.name,
            options: q.options || [],
            isRequired: q.isRequired || false,
            treatmentCategory
          });
        } else {
          // Merge options if same key exists
          const existing = uniqueQuestions.get(key)!;
          const mergedOptions = [...new Set([...existing.options, ...(q.options || [])])];
          existing.options = mergedOptions;
        }
      }
    }

    console.log(`Found ${uniqueQuestions.size} unique TWC questions to sync`);

    let optionsCreated = 0;
    let valuesCreated = 0;
    let optionsSkipped = 0;

    // Process each unique question
    for (const [key, questionData] of uniqueQuestions) {
      // Check if treatment_option already exists for this account
      const { data: existingOption } = await supabase
        .from('treatment_options')
        .select('id')
        .eq('account_id', accountId)
        .eq('key', key)
        .maybeSingle();

      if (existingOption) {
        console.log(`Option "${key}" already exists for account, skipping`);
        optionsSkipped++;
        continue;
      }

      // Create treatment_option with account_id
      const { data: newOption, error: optionError } = await supabase
        .from('treatment_options')
        .insert({
          account_id: accountId,
          treatment_category: questionData.treatmentCategory,
          key: key,
          label: questionData.label,
          input_type: 'select',
          order_index: 100 + optionsCreated,
          required: questionData.isRequired,
          visible: true
        })
        .select('id')
        .single();

      if (optionError) {
        console.error(`Error creating option "${key}":`, optionError);
        continue;
      }

      console.log(`Created treatment_option: ${key} (id: ${newOption.id})`);
      optionsCreated++;

      // Create option_values for each answer choice
      for (let i = 0; i < questionData.options.length; i++) {
        const optionValue = questionData.options[i];
        
        // Skip empty options
        if (!optionValue || optionValue.trim() === '') continue;
        
        const valueKey = generateKey(optionValue);

        const { error: valueError } = await supabase
          .from('option_values')
          .insert({
            treatment_option_id: newOption.id,
            label: optionValue,
            value: valueKey,
            code: optionValue,
            order_index: i,
            is_default: i === 0
          });

        if (valueError) {
          console.error(`Error creating value "${optionValue}" for option "${key}":`, valueError);
        } else {
          valuesCreated++;
        }
      }
    }

    const result = {
      success: true,
      products_processed: twcItems?.length || 0,
      unique_questions_found: uniqueQuestions.size,
      options_created: optionsCreated,
      options_skipped: optionsSkipped,
      values_created: valuesCreated
    };

    console.log('Re-sync complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in twc-resync-products:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50);
}

function mapCategoryToTreatment(category: string): string {
  const categoryLower = category?.toLowerCase() || '';
  
  if (categoryLower.includes('venetian')) return 'venetian_blinds';
  if (categoryLower.includes('roller')) return 'roller_blinds';
  if (categoryLower.includes('vertical')) return 'vertical_blinds';
  if (categoryLower.includes('cellular') || categoryLower.includes('honeycomb')) return 'cellular_blinds';
  if (categoryLower.includes('curtain')) return 'curtains';
  if (categoryLower.includes('roman')) return 'roman_blinds';
  if (categoryLower.includes('shutter')) return 'shutters';
  if (categoryLower.includes('awning')) return 'awnings';
  if (categoryLower.includes('panel')) return 'panel_glides';
  
  // Default to blinds for most TWC products
  return 'blinds';
}
