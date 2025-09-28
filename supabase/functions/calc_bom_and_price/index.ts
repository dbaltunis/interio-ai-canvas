import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalculationContext {
  // Measurements in mm
  rail_width_mm?: number;
  drop_mm?: number;
  ceiling_to_floor_mm?: number;
  wall_to_wall_mm?: number;
  recess_depth_mm?: number;
  
  // Calculated values
  panel_count?: number;
  fabric_width_mm?: number;
  repeat_mm?: number;
  puddle_mm?: number;
  overlap_mm?: number;
  returns_mm?: number;
  header_mm?: number;
  hem_mm?: number;
  
  // Options from template
  [key: string]: any;
}

interface BOMLine {
  item_id: string;
  item_name: string;
  role: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  uom: string;
}

interface PriceBreakdown {
  materials: number;
  labor: number;
  markup: number;
  total: number;
  bom_lines: BOMLine[];
}

// Safe expression evaluator for quantity formulas
function evaluateExpression(expression: string, context: CalculationContext): number {
  try {
    // Replace context variables in the expression
    let processedExpression = expression;
    
    // Replace known variables with values from context
    Object.keys(context).forEach(key => {
      const value = context[key];
      if (typeof value === 'number') {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        processedExpression = processedExpression.replace(regex, value.toString());
      }
    });
    
    // Replace mathematical functions
    processedExpression = processedExpression.replace(/ceil\(/g, 'Math.ceil(');
    processedExpression = processedExpression.replace(/floor\(/g, 'Math.floor(');
    processedExpression = processedExpression.replace(/max\(/g, 'Math.max(');
    processedExpression = processedExpression.replace(/min\(/g, 'Math.min(');
    
    // Validate that the expression only contains safe operations
    const safePattern = /^[\d\s+\-*/().Math,\w]+$/;
    if (!safePattern.test(processedExpression)) {
      throw new Error('Invalid expression');
    }
    
    // Evaluate the expression
    const result = eval(processedExpression);
    return typeof result === 'number' ? result : 0;
  } catch (error) {
    console.error('Error evaluating expression:', expression, error);
    return 0;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { org_id, template_id, window_type_id, state } = await req.json();

    // Validate input
    if (!org_id || !template_id || !state) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calculating BOM and price for:', { org_id, template_id, window_type_id });

    // Fetch template data
    const { data: template } = await supabase
      .from('product_templates')
      .select('*')
      .eq('id', template_id)
      .single();

    if (!template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch assemblies first
    const { data: assemblies } = await supabase
      .from('assemblies')
      .select('*')
      .eq('template_id', template_id);

    if (!assemblies || assemblies.length === 0) {
      throw new Error('No assemblies found for this template');
    }

    // Then fetch assembly lines and other data
    const [
      { data: assemblyLines },
      { data: inventoryItems },
      { data: pricingRules }
    ] = await Promise.all([
      supabase
        .from('assembly_lines')
        .select(`
          *,
          inventory_items:item_id (
            id, name, type, sku, price, cost, uom, attributes
          )
        `)
        .in('assembly_id', assemblies.map((a: any) => a.id)),
      
      supabase
        .from('inventory_items')
        .select('*')
        .eq('org_id', org_id)
        .eq('is_active', true),
      
      supabase
        .from('pricing_rules')
        .select('*')
        .eq('template_id', template_id)
    ]);

    // Build calculation context
    const context: CalculationContext = {
      // Default measurements
      rail_width_mm: state.rail_width_mm || 1000,
      drop_mm: state.drop_mm || 2000,
      ceiling_to_floor_mm: state.ceiling_to_floor_mm || 2400,
      wall_to_wall_mm: state.wall_to_wall_mm || 1200,
      recess_depth_mm: state.recess_depth_mm || 0,
      
      // Panel configuration
      panel_count: state.panel_setup === 'single' ? 1 : 2,
      puddle_mm: state.puddle_length || 0,
      overlap_mm: state.overlap || 0,
      returns_mm: state.returns || 0,
      header_mm: state.header_allowance || 80,
      hem_mm: state.hem_allowance || 150,
      
      // Fabric attributes from selected fabric
      fabric_width_mm: state.selected_fabric?.attributes?.width_mm || 1400,
      repeat_mm: state.selected_fabric?.attributes?.repeat_mm || 0,
      
      // All other state values
      ...state
    };

    console.log('Calculation context:', context);

    // Calculate BOM
    const bomLines: BOMLine[] = [];
    let materialsCost = 0;
    let laborCost = 0;

    for (const line of assemblyLines || []) {
      if (!line.inventory_items) continue;

      const item = line.inventory_items;
      
      // Evaluate quantity formula
      const baseQuantity = evaluateExpression(line.qty_formula, context);
      const quantity = baseQuantity * (1 + (line.wastage_pct || 0) / 100);
      
      if (quantity <= 0) continue;

      const unitPrice = line.price_mode === 'cost' ? item.cost : item.price;
      const totalPrice = quantity * (unitPrice || 0);

      const bomLine: BOMLine = {
        item_id: item.id,
        item_name: item.name,
        role: line.role || 'material',
        quantity: Math.round(quantity * 100) / 100, // Round to 2 decimal places
        unit_price: unitPrice || 0,
        total_price: Math.round(totalPrice * 100) / 100,
        uom: item.uom
      };

      bomLines.push(bomLine);

      // Categorize costs
      if (line.role === 'labour' || line.role === 'labor' || line.role === 'install') {
        laborCost += totalPrice;
      } else {
        materialsCost += totalPrice;
      }
    }

    // Apply pricing rules
    let markup = 0;
    let additionalFees = 0;

    for (const rule of pricingRules || []) {
      try {
        if (rule.rule?.type === 'markup_percentage') {
          markup += (materialsCost + laborCost) * (rule.rule.percentage / 100);
        } else if (rule.rule?.type === 'fixed_fee') {
          additionalFees += rule.rule.amount;
        } else if (rule.rule?.type === 'per_panel') {
          additionalFees += rule.rule.amount * (context.panel_count || 1);
        } else if (rule.rule?.type === 'ladder') {
          // Apply ladder pricing based on width and drop
          const ladders = rule.rule.ladders || [];
          for (const ladder of ladders) {
            if (
              (context.rail_width_mm || 0) >= (ladder.min_width || 0) &&
              (context.rail_width_mm || 0) <= (ladder.max_width || 99999) &&
              (context.drop_mm || 0) >= (ladder.min_drop || 0) &&
              (context.drop_mm || 0) <= (ladder.max_drop || 99999)
            ) {
              additionalFees += ladder.price || 0;
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error applying pricing rule:', rule, error);
      }
    }

    const subtotal = materialsCost + laborCost + additionalFees;
    const total = subtotal + markup;

    const priceBreakdown: PriceBreakdown = {
      materials: Math.round(materialsCost * 100) / 100,
      labor: Math.round(laborCost * 100) / 100,
      markup: Math.round(markup * 100) / 100,
      total: Math.round(total * 100) / 100,
      bom_lines: bomLines
    };

    console.log('Price breakdown:', priceBreakdown);

    return new Response(
      JSON.stringify({
        bom: bomLines,
        price_breakdown: priceBreakdown,
        price_total: priceBreakdown.total
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating BOM and price:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});