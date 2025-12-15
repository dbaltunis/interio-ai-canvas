import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-key',
};

// Rachel's account ID
const RACHEL_USER_ID = '708d8e36-8fa3-4e07-b43b-c0a90941f991';

// Simple admin key for one-time setup (change after use)
const ADMIN_KEY = 'homekaara-setup-2024';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin key for this one-time setup
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== ADMIN_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: any = {
      phase1_cleanup: {},
      phase2_settings: {},
      phase3_options: {},
      phase4_templates: {},
      phase5_inventory: {},
    };

    console.log('Starting Homekaara account setup for user:', RACHEL_USER_ID);

    // ============================================
    // PHASE 1: Clear all existing data
    // ============================================
    console.log('Phase 1: Clearing existing data...');

    // Get quotes first
    const { data: quotes } = await supabase
      .from('quotes')
      .select('id')
      .eq('user_id', RACHEL_USER_ID);
    const quoteIds = quotes?.map(q => q.id) || [];

    // Delete quote_items
    if (quoteIds.length > 0) {
      await supabase.from('quote_items').delete().in('quote_id', quoteIds);
    }

    // Delete quotes
    const { data: deletedQuotes } = await supabase
      .from('quotes')
      .delete()
      .eq('user_id', RACHEL_USER_ID)
      .select('id');
    results.phase1_cleanup.quotes = deletedQuotes?.length || 0;

    // Get projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', RACHEL_USER_ID);
    const projectIds = projects?.map(p => p.id) || [];

    // Get rooms
    if (projectIds.length > 0) {
      const { data: rooms } = await supabase
        .from('rooms')
        .select('id')
        .in('project_id', projectIds);
      const roomIds = rooms?.map(r => r.id) || [];

      // Delete windows
      if (roomIds.length > 0) {
        await supabase.from('windows').delete().in('room_id', roomIds);
      }

      // Delete rooms
      await supabase.from('rooms').delete().in('project_id', projectIds);
    }

    // Delete projects
    const { data: deletedProjects } = await supabase
      .from('projects')
      .delete()
      .eq('user_id', RACHEL_USER_ID)
      .select('id');
    results.phase1_cleanup.projects = deletedProjects?.length || 0;

    // Delete clients
    const { data: deletedClients } = await supabase
      .from('clients')
      .delete()
      .eq('user_id', RACHEL_USER_ID)
      .select('id');
    results.phase1_cleanup.clients = deletedClients?.length || 0;

    // Get templates
    const { data: templates } = await supabase
      .from('curtain_templates')
      .select('id')
      .eq('user_id', RACHEL_USER_ID);
    const templateIds = templates?.map(t => t.id) || [];

    // Delete template_option_settings
    if (templateIds.length > 0) {
      await supabase.from('template_option_settings').delete().in('template_id', templateIds);
      await supabase.from('template_grid_assignments').delete().in('template_id', templateIds);
    }

    // Delete curtain_templates
    const { data: deletedTemplates } = await supabase
      .from('curtain_templates')
      .delete()
      .eq('user_id', RACHEL_USER_ID)
      .select('id');
    results.phase1_cleanup.templates = deletedTemplates?.length || 0;

    // Get treatment_options
    const { data: options } = await supabase
      .from('treatment_options')
      .select('id')
      .eq('account_id', RACHEL_USER_ID);
    const optionIds = options?.map(o => o.id) || [];

    // Delete option_values
    if (optionIds.length > 0) {
      await supabase.from('option_values').delete().in('option_id', optionIds);
    }

    // Delete treatment_options
    const { data: deletedOptions } = await supabase
      .from('treatment_options')
      .delete()
      .eq('account_id', RACHEL_USER_ID)
      .select('id');
    results.phase1_cleanup.treatment_options = deletedOptions?.length || 0;

    // Delete pricing_grids
    const { data: deletedGrids } = await supabase
      .from('pricing_grids')
      .delete()
      .eq('user_id', RACHEL_USER_ID)
      .select('id');
    results.phase1_cleanup.pricing_grids = deletedGrids?.length || 0;

    // Delete enhanced_inventory_items
    const { data: deletedInventory } = await supabase
      .from('enhanced_inventory_items')
      .delete()
      .eq('user_id', RACHEL_USER_ID)
      .select('id');
    results.phase1_cleanup.inventory_items = deletedInventory?.length || 0;

    console.log('Phase 1 complete:', results.phase1_cleanup);

    // ============================================
    // PHASE 2: Update business settings
    // ============================================
    console.log('Phase 2: Updating business settings...');

    const { error: bsErr } = await supabase
      .from('business_settings')
      .upsert({
        user_id: RACHEL_USER_ID,
        company_name: 'Homekaara',
        country: 'India',
        tax_type: 'gst',
        tax_rate: 18,
        measurement_units: JSON.stringify({
          system: 'mixed',
          length: 'in',
          area: 'sqft',
          fabric: 'm',
          currency: 'INR'
        }),
        pricing_settings: JSON.stringify({
          default_markup_percentage: 50,
          minimum_markup_percentage: 20
        })
      }, { onConflict: 'user_id' });

    if (bsErr) console.error('Business settings error:', bsErr);
    results.phase2_settings.business_settings = !bsErr;

    // Update account_settings for currency
    const { error: asErr } = await supabase
      .from('account_settings')
      .upsert({
        account_owner_id: RACHEL_USER_ID,
        currency: 'INR',
        language: 'en',
        measurement_units: {
          system: 'mixed',
          length: 'in',
          area: 'sqft',
          fabric: 'm',
          currency: 'INR'
        }
      }, { onConflict: 'account_owner_id' });

    if (asErr) console.error('Account settings error:', asErr);
    results.phase2_settings.account_settings = !asErr;

    console.log('Phase 2 complete');

    // ============================================
    // PHASE 3: Create Treatment Options
    // ============================================
    console.log('Phase 3: Creating treatment options...');

    // 3.1 Lining Option (for Curtains)
    const { data: liningOption, error: liningOptErr } = await supabase
      .from('treatment_options')
      .insert({
        account_id: RACHEL_USER_ID,
        treatment_category: 'curtains',
        key: 'lining',
        label: 'Lining',
        input_type: 'select',
        required: false,
        order_index: 10,
        visible: true
      })
      .select()
      .single();

    if (liningOption) {
      const liningValues = [
        { label: 'No Lining', extra_data: { price: 0, pricing_method: 'per_linear_meter' } },
        { label: 'Basique', extra_data: { price: 240, pricing_method: 'per_linear_meter' } },
        { label: 'Modique', extra_data: { price: 340, pricing_method: 'per_linear_meter' } },
        { label: 'Oblique', extra_data: { price: 440, pricing_method: 'per_linear_meter' } },
        { label: 'Darque', extra_data: { price: 340, pricing_method: 'per_linear_meter' } },
        { label: 'Metalique', extra_data: { price: 640, pricing_method: 'per_linear_meter' } },
      ];

      for (let i = 0; i < liningValues.length; i++) {
        await supabase.from('option_values').insert({
          option_id: liningOption.id,
          value: liningValues[i].label.toLowerCase().replace(/\s+/g, '_'),
          label: liningValues[i].label,
          order_index: i,
          extra_data: liningValues[i].extra_data
        });
      }
      results.phase3_options.lining = liningValues.length;
    }

    // 3.2 Roman Blind Lining (same options)
    const { data: romanLiningOption } = await supabase
      .from('treatment_options')
      .insert({
        account_id: RACHEL_USER_ID,
        treatment_category: 'roman_blinds',
        key: 'lining',
        label: 'Lining',
        input_type: 'select',
        required: false,
        order_index: 10,
        visible: true
      })
      .select()
      .single();

    if (romanLiningOption) {
      const liningValues = [
        { label: 'No Lining', extra_data: { price: 0, pricing_method: 'per_sqft' } },
        { label: 'Basique', extra_data: { price: 240, pricing_method: 'per_linear_meter' } },
        { label: 'Modique', extra_data: { price: 340, pricing_method: 'per_linear_meter' } },
        { label: 'Oblique', extra_data: { price: 440, pricing_method: 'per_linear_meter' } },
        { label: 'Darque', extra_data: { price: 340, pricing_method: 'per_linear_meter' } },
        { label: 'Metalique', extra_data: { price: 640, pricing_method: 'per_linear_meter' } },
      ];

      for (let i = 0; i < liningValues.length; i++) {
        await supabase.from('option_values').insert({
          option_id: romanLiningOption.id,
          value: liningValues[i].label.toLowerCase().replace(/\s+/g, '_'),
          label: liningValues[i].label,
          order_index: i,
          extra_data: liningValues[i].extra_data
        });
      }
    }

    // 3.3 Curtain Tie-back Option
    const { data: tiebackOption } = await supabase
      .from('treatment_options')
      .insert({
        account_id: RACHEL_USER_ID,
        treatment_category: 'curtains',
        key: 'tieback',
        label: 'Tie-back',
        input_type: 'select',
        required: false,
        order_index: 20,
        visible: true
      })
      .select()
      .single();

    if (tiebackOption) {
      const tiebackValues = [
        { label: 'No Tie', value: 'no_tie', extra_data: { price: 0, pricing_method: 'fixed' } },
        { label: 'Attached Tie', value: 'attached_tie', extra_data: { price: 0, pricing_method: 'calculated_from_fabric', description: 'Calculated from fabric' } },
        { label: 'Tie Belt', value: 'tie_belt', extra_data: { price: 0, pricing_method: 'calculated_from_fabric', description: 'Calculated from fabric' } },
      ];

      for (let i = 0; i < tiebackValues.length; i++) {
        await supabase.from('option_values').insert({
          option_id: tiebackOption.id,
          value: tiebackValues[i].value,
          label: tiebackValues[i].label,
          order_index: i,
          extra_data: tiebackValues[i].extra_data
        });
      }
      results.phase3_options.tieback = tiebackValues.length;
    }

    // 3.4 Roman Blind Control Option
    const { data: controlOption } = await supabase
      .from('treatment_options')
      .insert({
        account_id: RACHEL_USER_ID,
        treatment_category: 'roman_blinds',
        key: 'control_system',
        label: 'Control System',
        input_type: 'select',
        required: true,
        order_index: 5,
        visible: true
      })
      .select()
      .single();

    if (controlOption) {
      const controlValues = [
        { 
          label: 'White Ball Chain (Standard)', 
          value: 'white_ball_chain',
          extra_data: { 
            headrail_price: 800, 
            chain_price_per_meter: 232,
            pricing_method: 'per_rft',
            description: 'White ball chain with standard headrail'
          }
        },
        { 
          label: 'Steel Ball Chain (Upgrade)', 
          value: 'steel_ball_chain',
          extra_data: { 
            headrail_price: 1160, 
            chain_price_per_meter: 500,
            pricing_method: 'per_rft',
            description: 'Steel ball chain with upgraded headrail'
          }
        },
      ];

      for (let i = 0; i < controlValues.length; i++) {
        await supabase.from('option_values').insert({
          option_id: controlOption.id,
          value: controlValues[i].value,
          label: controlValues[i].label,
          order_index: i,
          extra_data: controlValues[i].extra_data
        });
      }
      results.phase3_options.control_system = controlValues.length;
    }

    // 3.5 Curtain Header/Stitching Option
    const { data: headerOption } = await supabase
      .from('treatment_options')
      .insert({
        account_id: RACHEL_USER_ID,
        treatment_category: 'curtains',
        key: 'header_style',
        label: 'Header & Stitching',
        input_type: 'select',
        required: true,
        order_index: 1,
        visible: true
      })
      .select()
      .single();

    if (headerOption) {
      const headerValues = [
        { label: 'Eyelet - Tailor', value: 'eyelet_tailor', extra_data: { price: 200, pricing_method: 'per_panel' } },
        { label: 'Eyelet - Factory', value: 'eyelet_factory', extra_data: { price: 225, pricing_method: 'per_panel' } },
        { label: 'Pleated - Tailor', value: 'pleated_tailor', extra_data: { price: 150, pricing_method: 'per_panel' } },
        { label: 'Pleated - Factory', value: 'pleated_factory', extra_data: { price: 250, pricing_method: 'per_panel' } },
        { label: 'Rod Pocket - Tailor', value: 'rod_pocket_tailor', extra_data: { price: 150, pricing_method: 'per_panel' } },
        { label: 'Rod Pocket - Factory', value: 'rod_pocket_factory', extra_data: { price: 180, pricing_method: 'per_panel' } },
        { label: 'Wave - Factory', value: 'wave_factory', extra_data: { price: 300, pricing_method: 'per_panel' } },
        { label: 'European - Factory', value: 'european_factory', extra_data: { price: 450, pricing_method: 'per_panel' } },
      ];

      for (let i = 0; i < headerValues.length; i++) {
        await supabase.from('option_values').insert({
          option_id: headerOption.id,
          value: headerValues[i].value,
          label: headerValues[i].label,
          order_index: i,
          extra_data: headerValues[i].extra_data
        });
      }
      results.phase3_options.header_style = headerValues.length;
    }

    // 3.6 Curtain Installation Option
    const { data: curtainInstallOption } = await supabase
      .from('treatment_options')
      .insert({
        account_id: RACHEL_USER_ID,
        treatment_category: 'curtains',
        key: 'installation',
        label: 'Installation',
        input_type: 'select',
        required: false,
        order_index: 30,
        visible: true
      })
      .select()
      .single();

    if (curtainInstallOption) {
      const installValues = [
        { label: 'No Installation', value: 'none', extra_data: { price: 0, pricing_method: 'fixed' } },
        { label: 'Installation (₹50/panel, min ₹750)', value: 'standard', extra_data: { price: 50, pricing_method: 'per_panel', minimum: 750 } },
      ];

      for (let i = 0; i < installValues.length; i++) {
        await supabase.from('option_values').insert({
          option_id: curtainInstallOption.id,
          value: installValues[i].value,
          label: installValues[i].label,
          order_index: i,
          extra_data: installValues[i].extra_data
        });
      }
    }

    // 3.7 Curtain Packaging Option
    const { data: curtainPackOption } = await supabase
      .from('treatment_options')
      .insert({
        account_id: RACHEL_USER_ID,
        treatment_category: 'curtains',
        key: 'packaging',
        label: 'Packaging',
        input_type: 'select',
        required: false,
        order_index: 35,
        visible: true
      })
      .select()
      .single();

    if (curtainPackOption) {
      const packValues = [
        { label: 'No Packaging', value: 'none', extra_data: { price: 0, pricing_method: 'fixed' } },
        { label: 'Standard Packaging (₹20/panel)', value: 'standard', extra_data: { price: 20, pricing_method: 'per_panel' } },
      ];

      for (let i = 0; i < packValues.length; i++) {
        await supabase.from('option_values').insert({
          option_id: curtainPackOption.id,
          value: packValues[i].value,
          label: packValues[i].label,
          order_index: i,
          extra_data: packValues[i].extra_data
        });
      }
    }

    // 3.8 Roman Blind Installation
    const { data: romanInstallOption } = await supabase
      .from('treatment_options')
      .insert({
        account_id: RACHEL_USER_ID,
        treatment_category: 'roman_blinds',
        key: 'installation',
        label: 'Installation',
        input_type: 'select',
        required: false,
        order_index: 30,
        visible: true
      })
      .select()
      .single();

    if (romanInstallOption) {
      await supabase.from('option_values').insert([
        { option_id: romanInstallOption.id, value: 'none', label: 'No Installation', order_index: 0, extra_data: { price: 0, pricing_method: 'fixed' } },
        { option_id: romanInstallOption.id, value: 'standard', label: 'Installation (₹1000/blind)', order_index: 1, extra_data: { price: 1000, pricing_method: 'per_unit' } },
      ]);
    }

    // 3.9 Roman Blind Packaging
    const { data: romanPackOption } = await supabase
      .from('treatment_options')
      .insert({
        account_id: RACHEL_USER_ID,
        treatment_category: 'roman_blinds',
        key: 'packaging',
        label: 'Packaging',
        input_type: 'select',
        required: false,
        order_index: 35,
        visible: true
      })
      .select()
      .single();

    if (romanPackOption) {
      await supabase.from('option_values').insert([
        { option_id: romanPackOption.id, value: 'none', label: 'No Packaging', order_index: 0, extra_data: { price: 0, pricing_method: 'fixed' } },
        { option_id: romanPackOption.id, value: 'standard', label: 'Standard Packaging (₹200/blind)', order_index: 1, extra_data: { price: 200, pricing_method: 'per_unit' } },
      ]);
    }

    // 3.10 Roller Blind Cassette Option
    const { data: cassetteOption } = await supabase
      .from('treatment_options')
      .insert({
        account_id: RACHEL_USER_ID,
        treatment_category: 'roller_blinds',
        key: 'cassette',
        label: 'Cassette Upgrade',
        input_type: 'select',
        required: false,
        order_index: 5,
        visible: true
      })
      .select()
      .single();

    if (cassetteOption) {
      await supabase.from('option_values').insert([
        { option_id: cassetteOption.id, value: 'none', label: 'Standard (No Cassette)', order_index: 0, extra_data: { price: 0, pricing_method: 'fixed' } },
        { option_id: cassetteOption.id, value: 'cassette', label: 'With Cassette (+₹100/sqft)', order_index: 1, extra_data: { price: 100, pricing_method: 'per_sqft' } },
      ]);
    }

    console.log('Phase 3 complete:', results.phase3_options);

    // ============================================
    // PHASE 4: Create Templates
    // ============================================
    console.log('Phase 4: Creating templates...');

    // 4.1 Curtain Template
    const { data: curtainTemplate, error: ctErr } = await supabase
      .from('curtain_templates')
      .insert({
        user_id: RACHEL_USER_ID,
        name: 'Homekaara Curtains',
        treatment_category: 'curtains',
        curtain_type: 'curtain',
        pricing_type: 'per_linear_meter',
        manufacturing_type: 'custom',
        active: true,
        description: 'Standard curtain template with header options, linings, and tie-backs'
      })
      .select()
      .single();

    if (curtainTemplate) {
      results.phase4_templates.curtain = curtainTemplate.id;
      
      // Link options to template
      const { data: curtainOptions } = await supabase
        .from('treatment_options')
        .select('id')
        .eq('account_id', RACHEL_USER_ID)
        .eq('treatment_category', 'curtains');

      if (curtainOptions) {
        for (const opt of curtainOptions) {
          await supabase.from('template_option_settings').insert({
            template_id: curtainTemplate.id,
            option_id: opt.id,
            is_enabled: true
          });
        }
      }
    }

    // 4.2 Roman Blind Template
    const { data: romanTemplate } = await supabase
      .from('curtain_templates')
      .insert({
        user_id: RACHEL_USER_ID,
        name: 'Homekaara Roman Blinds',
        treatment_category: 'roman_blinds',
        curtain_type: 'roman_blind',
        pricing_type: 'per_sqft',
        manufacturing_type: 'custom',
        active: true,
        description: 'Roman blind template with ₹360/sqft base, min 16 sqft',
        base_price: 360,
        minimum_sqft: 16
      })
      .select()
      .single();

    if (romanTemplate) {
      results.phase4_templates.roman_blind = romanTemplate.id;

      const { data: romanOptions } = await supabase
        .from('treatment_options')
        .select('id')
        .eq('account_id', RACHEL_USER_ID)
        .eq('treatment_category', 'roman_blinds');

      if (romanOptions) {
        for (const opt of romanOptions) {
          await supabase.from('template_option_settings').insert({
            template_id: romanTemplate.id,
            option_id: opt.id,
            is_enabled: true
          });
        }
      }
    }

    // 4.3 Roller Blind Template
    const { data: rollerTemplate } = await supabase
      .from('curtain_templates')
      .insert({
        user_id: RACHEL_USER_ID,
        name: 'Homekaara Roller Blinds',
        treatment_category: 'roller_blinds',
        curtain_type: 'roller_blind',
        pricing_type: 'pricing_grid',
        manufacturing_type: 'ready_made',
        active: true,
        description: 'Roller blind template with per-sqft pricing grids, min 12 sqft',
        minimum_sqft: 12
      })
      .select()
      .single();

    if (rollerTemplate) {
      results.phase4_templates.roller_blind = rollerTemplate.id;

      const { data: rollerOptions } = await supabase
        .from('treatment_options')
        .select('id')
        .eq('account_id', RACHEL_USER_ID)
        .eq('treatment_category', 'roller_blinds');

      if (rollerOptions) {
        for (const opt of rollerOptions) {
          await supabase.from('template_option_settings').insert({
            template_id: rollerTemplate.id,
            option_id: opt.id,
            is_enabled: true
          });
        }
      }
    }

    // 4.4 Zebra Blind Template
    const { data: zebraTemplate } = await supabase
      .from('curtain_templates')
      .insert({
        user_id: RACHEL_USER_ID,
        name: 'Homekaara Zebra Blinds',
        treatment_category: 'zebra_blinds',
        curtain_type: 'zebra_blind',
        pricing_type: 'pricing_grid',
        manufacturing_type: 'ready_made',
        active: true,
        description: 'Zebra/Dual blind template with per-sqft pricing grids, min 12 sqft',
        minimum_sqft: 12
      })
      .select()
      .single();

    if (zebraTemplate) {
      results.phase4_templates.zebra_blind = zebraTemplate.id;
    }

    console.log('Phase 4 complete:', results.phase4_templates);

    // ============================================
    // PHASE 5: Import Inventory
    // ============================================
    console.log('Phase 5: Importing inventory...');

    // 5.1 Import Roller/Zebra Blind Materials from extracted data
    const blindProducts = [
      // Roller Blinds - Sunscreen
      { name: 'Solyx Sunscreen', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 349, colors: ['Cream', 'Sand', 'Cocoa', 'Mocha', 'Black', 'White'] },
      { name: 'Sunshade II Sunscreen', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 199, colors: ['White', 'Cream', 'Grey', 'Black'] },
      { name: 'Alina Sunscreen', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 259, colors: ['White', 'Sand', 'Cream', 'Bronze'] },
      { name: 'Sungate Sunscreen', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 259, colors: ['White', 'Cream', 'Sand'] },
      { name: 'Infinity Sunscreen', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 289, colors: ['White', 'Cream', 'Grey', 'Black'] },
      
      // Roller Blinds - Blackout
      { name: 'Noctile Blackout', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 179, colors: ['White', 'Cream', 'Grey', 'Black', 'Beige'] },
      { name: 'Essen Blackout', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 249, colors: ['White', 'Cream', 'Grey', 'Charcoal'] },
      { name: 'Florance Blackout', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 249, colors: ['White', 'Ivory', 'Grey', 'Taupe'] },
      { name: 'Lumen Block Blackout', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 269, colors: ['Pure White', 'Off White', 'Silver', 'Black'] },
      { name: 'Vegas Blackout', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 279, colors: ['White', 'Cream', 'Gold', 'Silver'] },
      { name: 'Texture Plus Blackout', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 299, colors: ['Linen', 'Sand', 'Grey', 'Charcoal'] },
      { name: 'Canvas Blackout', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 329, colors: ['Natural', 'Cream', 'Grey', 'Black'] },
      { name: 'Denver Blackout', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 349, colors: ['White', 'Cream', 'Bronze', 'Graphite'] },
      { name: 'Boston Blackout', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 369, colors: ['White', 'Ivory', 'Pewter', 'Black'] },
      
      // Roller Blinds - Light Filter
      { name: 'Carina Light Filter', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 179, colors: ['White', 'Cream', 'Linen', 'Grey'] },
      { name: 'Mirage Light Filter', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 199, colors: ['White', 'Cream', 'Beige', 'Cocoa'] },
      { name: 'Lumi Linen Light Filter', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 229, colors: ['Natural', 'Sand', 'Grey', 'Charcoal'] },
      { name: 'Texture Plus Light Filter', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 259, colors: ['Linen', 'Sand', 'Grey', 'Mocha'] },
      { name: 'Denver Light Filter', category: 'materials', subcategory: 'roller_fabric', type: 'roller', mrp: 309, colors: ['White', 'Natural', 'Grey', 'Taupe'] },
      
      // Zebra Blinds
      { name: 'Zebra Basic', category: 'materials', subcategory: 'zebra_fabric', type: 'zebra', mrp: 279, colors: ['White', 'Cream', 'Grey', 'Black'] },
      { name: 'Zebra Premium', category: 'materials', subcategory: 'zebra_fabric', type: 'zebra', mrp: 349, colors: ['White', 'Ivory', 'Linen', 'Charcoal'] },
      { name: 'Zebra Lux', category: 'materials', subcategory: 'zebra_fabric', type: 'zebra', mrp: 399, colors: ['Pearl', 'Champagne', 'Graphite', 'Onyx'] },
      { name: 'Duo Roll', category: 'materials', subcategory: 'zebra_fabric', type: 'zebra', mrp: 329, colors: ['White', 'Cream', 'Sand', 'Grey'] },
    ];

    let blindItemsCreated = 0;
    for (const product of blindProducts) {
      const { data: parentItem } = await supabase
        .from('enhanced_inventory_items')
        .insert({
          user_id: RACHEL_USER_ID,
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          item_type: 'material',
          selling_price: product.mrp,
          pricing_method: 'per_sqft',
          tags: product.colors,
          active: true,
          metadata: {
            blind_type: product.type,
            mrp_per_sqft: product.mrp,
            colors: product.colors,
            cassette_upgrade: 100
          }
        })
        .select()
        .single();

      if (parentItem) {
        blindItemsCreated++;
      }
    }
    results.phase5_inventory.blind_materials = blindItemsCreated;

    // 5.2 Import Hardware - Tracks
    const tracks = [
      { name: 'Kings Choice Track', price_per_ft: 88, runners: 3.6, jointers: 80, brackets: 25 },
      { name: 'Curtain Track Standard', price_per_ft: 65, runners: 3, jointers: 60, brackets: 20 },
      { name: 'Premium Motorized Track', price_per_ft: 250, runners: 5, jointers: 100, brackets: 45 },
      { name: 'Wave Track System', price_per_ft: 180, runners: 8, jointers: 90, brackets: 35 },
      { name: 'S-Fold Track', price_per_ft: 150, runners: 6, jointers: 75, brackets: 30 },
      { name: 'Double Track System', price_per_ft: 120, runners: 4, jointers: 70, brackets: 28 },
      { name: 'Ceiling Mount Track', price_per_ft: 95, runners: 3.5, jointers: 65, brackets: 22 },
      { name: 'Flexible Bend Track', price_per_ft: 135, runners: 4.5, jointers: 85, brackets: 32 },
      { name: 'Hospital Track', price_per_ft: 110, runners: 4, jointers: 70, brackets: 26 },
      { name: 'Heavy Duty Track', price_per_ft: 145, runners: 5, jointers: 95, brackets: 38 },
    ];

    let tracksCreated = 0;
    for (const track of tracks) {
      const { data: trackItem } = await supabase
        .from('enhanced_inventory_items')
        .insert({
          user_id: RACHEL_USER_ID,
          name: track.name,
          category: 'hardware',
          subcategory: 'track',
          item_type: 'hardware',
          selling_price: track.price_per_ft,
          pricing_method: 'per_linear_meter',
          active: true,
          metadata: {
            price_per_ft: track.price_per_ft,
            runner_price: track.runners,
            jointer_price: track.jointers,
            bracket_price: track.brackets,
            runners_per_ft: 6,
            jointers_per_ft: 0.2,
            brackets_per_ft: 0.5
          }
        })
        .select()
        .single();

      if (trackItem) tracksCreated++;
    }
    results.phase5_inventory.tracks = tracksCreated;

    // 5.3 Import Hardware - Rods
    const rods = [
      { name: 'Curtain Rod - Stainless Steel', finish: 'SS', rod_per_ft: 120, end_cap: 150, finial: 250, bracket: 180, ring: 25 },
      { name: 'Curtain Rod - Black', finish: 'Black', rod_per_ft: 110, end_cap: 140, finial: 220, bracket: 160, ring: 22 },
      { name: 'Curtain Rod - Antique', finish: 'Antique', rod_per_ft: 135, end_cap: 165, finial: 280, bracket: 195, ring: 28 },
    ];

    let rodsCreated = 0;
    for (const rod of rods) {
      const { data: rodItem } = await supabase
        .from('enhanced_inventory_items')
        .insert({
          user_id: RACHEL_USER_ID,
          name: rod.name,
          category: 'hardware',
          subcategory: 'rod',
          item_type: 'hardware',
          selling_price: rod.rod_per_ft,
          pricing_method: 'per_linear_meter',
          active: true,
          metadata: {
            finish: rod.finish,
            rod_per_ft: rod.rod_per_ft,
            end_cap_price: rod.end_cap,
            finial_price: rod.finial,
            bracket_price: rod.bracket,
            ring_price: rod.ring
          }
        })
        .select()
        .single();

      if (rodItem) rodsCreated++;
    }
    results.phase5_inventory.rods = rodsCreated;

    console.log('Phase 5 complete:', results.phase5_inventory);

    // ============================================
    // Summary
    // ============================================
    const summary = {
      success: true,
      account: 'baltunis+rachel@curtainscalculator.com',
      setup_for: 'Homekaara',
      results
    };

    console.log('Homekaara setup complete:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in setup-homekaara-account:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
