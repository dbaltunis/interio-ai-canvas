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
    const { featureKey } = await req.json();

    if (!featureKey) {
      throw new Error('Missing featureKey parameter');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    // Get user subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans(features_included)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({ hasAccess: false, reason: 'No active subscription' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if feature is included in base plan
    const planFeatures = subscription.subscription_plan?.features_included || {};
    if (planFeatures[featureKey] === true) {
      return new Response(
        JSON.stringify({ hasAccess: true, source: 'base_plan' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has add-on
    const { data: userAddOns, error: addOnError } = await supabase
      .from('user_subscription_add_ons')
      .select(`
        *,
        add_on:subscription_add_ons(feature_key)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (!addOnError && userAddOns) {
      const hasAddOn = userAddOns.some(
        (addon: any) => addon.add_on?.feature_key === featureKey
      );

      if (hasAddOn) {
        return new Response(
          JSON.stringify({ hasAccess: true, source: 'add_on' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ hasAccess: false, reason: 'Feature not included in plan' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Feature access check error:', error);
    
    return new Response(
      JSON.stringify({ 
        hasAccess: false,
        error: error.message || 'Internal server error',
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
