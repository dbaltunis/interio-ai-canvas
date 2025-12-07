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

    // Fetch all TWC inventory items with metadata - use user.id not accountId for user_id column
    const { data: twcItems, error: itemsError } = await supabase
      .from('enhanced_inventory_items')
      .select('id, name, category, metadata')
      .eq('user_id', user.id)
      .not('metadata->twc_item_number', 'is', null);

    if (itemsError) {
      console.error('Error fetching TWC items:', itemsError);
      throw itemsError;
    }

    console.log(`Found ${twcItems?.length || 0} TWC inventory items`);

    // Fetch templates linked to these inventory items
    const itemIds = twcItems?.map(item => item.id) || [];
    const { data: templates } = await supabase
      .from('curtain_templates')
      .select('id, name, inventory_item_id, treatment_category')
      .in('inventory_item_id', itemIds.length > 0 ? itemIds : ['no-match']);

    console.log(`Found ${templates?.length || 0} linked templates`);

    // Create a map of inventory_item_id to template
    const templateMap = new Map<string, { id: string; treatment_category: string }>();
    for (const template of templates || []) {
      if (template.inventory_item_id) {
        templateMap.set(template.inventory_item_id, {
          id: template.id,
          treatment_category: template.treatment_category
        });
      }
    }

    // Extract unique questions from all TWC items
    // TWC data format: { question: string, questionType: string, answers: string[] }
    // OR format: { name: string, options: string[], isRequired: boolean }
    const uniqueQuestions = new Map<string, {
      key: string;
      label: string;
      options: string[];
      isRequired: boolean;
      treatmentCategory: string;
      sourceItemIds: string[];
    }>();

    for (const item of twcItems || []) {
      const questions = item.metadata?.twc_questions || [];
      const treatmentCategory = mapCategoryToTreatment(item.category);
      
      for (const q of questions) {
        // Handle both TWC API format and stored format
        // Format 1: { question, questionType, answers }
        // Format 2: { name, options, isRequired }
        const questionLabel = q.question || q.name;
        const answerOptions = q.answers || q.options || [];
        const isRequired = q.isRequired || false;
        
        if (!questionLabel) continue;
        
        // Use the question label as the key
        const key = generateKey(questionLabel);
        
        // Skip questions with no options
        if (!answerOptions || answerOptions.length === 0) continue;
        
        if (!uniqueQuestions.has(key)) {
          uniqueQuestions.set(key, {
            key,
            label: questionLabel,
            options: answerOptions,
            isRequired,
            treatmentCategory,
            sourceItemIds: [item.id]
          });
        } else {
          // Merge options if same key exists
          const existing = uniqueQuestions.get(key)!;
          const mergedOptions = [...new Set([...existing.options, ...answerOptions])];
          existing.options = mergedOptions;
          existing.sourceItemIds.push(item.id);
        }
      }
    }

    console.log(`Found ${uniqueQuestions.size} unique TWC questions to sync`);

    let optionsCreated = 0;
    let valuesCreated = 0;
    let optionsSkipped = 0;
    let templateSettingsCreated = 0;

    // Process each unique question
    for (const [key, questionData] of uniqueQuestions) {
      // Check if treatment_option already exists for this account
      let optionId: string | null = null;
      
      const { data: existingOption } = await supabase
        .from('treatment_options')
        .select('id')
        .eq('account_id', accountId)
        .eq('key', key)
        .maybeSingle();

      if (existingOption) {
        console.log(`Option "${key}" already exists for account, will link to templates`);
        optionId = existingOption.id;
        optionsSkipped++;
      } else {
        // Create treatment_option with account_id and source metadata
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
            visible: true,
            metadata: {
              source: 'twc',
              imported_at: new Date().toISOString()
            }
          })
          .select('id')
          .single();

        if (optionError) {
          console.error(`Error creating option "${key}":`, optionError);
          continue;
        }

        console.log(`Created treatment_option: ${key} (id: ${newOption.id})`);
        optionId = newOption.id;
        optionsCreated++;

        // Create option_values for each answer choice
        for (let i = 0; i < questionData.options.length; i++) {
          const optionValue = questionData.options[i];
          
          // Skip empty options
          if (!optionValue || optionValue.trim() === '') continue;
          
          const valueCode = generateKey(optionValue);

          const { error: valueError } = await supabase
            .from('option_values')
            .insert({
              option_id: optionId,          // Correct column name (not treatment_option_id)
              account_id: accountId,         // Required column - was missing!
              code: valueCode,               // Use generated code
              label: optionValue,            // Human-readable label
              order_index: i,
              extra_data: {
                is_default: i === 0,
                source: 'twc'
              }
            });

          if (valueError) {
            console.error(`Error creating value "${optionValue}" for option "${key}":`, valueError);
          } else {
            valuesCreated++;
          }
        }
      }

      // Enable option for all related templates
      if (optionId) {
        for (const sourceItemId of questionData.sourceItemIds) {
          const template = templateMap.get(sourceItemId);
          if (template) {
            // Check if setting already exists
            const { data: existingSetting } = await supabase
              .from('template_option_settings')
              .select('id')
              .eq('template_id', template.id)
              .eq('treatment_option_id', optionId)
              .maybeSingle();

            if (!existingSetting) {
              const { error: settingError } = await supabase
                .from('template_option_settings')
                .insert({
                  template_id: template.id,
                  treatment_option_id: optionId,
                  is_enabled: true,
                  order_index: 100 + templateSettingsCreated
                });

              if (settingError) {
                console.error(`Error creating template_option_setting:`, settingError);
              } else {
                console.log(`Enabled option "${key}" for template ${template.id}`);
                templateSettingsCreated++;
              }
            }
          }
        }
      }
    }

    const result = {
      success: true,
      products_processed: twcItems?.length || 0,
      unique_questions_found: uniqueQuestions.size,
      options_created: optionsCreated,
      options_skipped: optionsSkipped,
      values_created: valuesCreated,
      template_settings_created: templateSettingsCreated
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
