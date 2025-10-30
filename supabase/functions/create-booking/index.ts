import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      scheduler_id,
      customer_name,
      customer_email,
      customer_phone,
      appointment_date,
      appointment_time,
      location_type,
      notes,
      status = 'confirmed'
    } = await req.json();

    console.log('Creating booking:', {
      scheduler_id,
      customer_name,
      customer_email,
      appointment_date,
      appointment_time
    });

    // Validate required fields
    if (!scheduler_id || !customer_name || !customer_email || !appointment_date || !appointment_time) {
      throw new Error('Missing required fields');
    }

    // Check if scheduler exists and is active
    const { data: scheduler, error: schedulerError } = await supabase
      .from('appointment_schedulers')
      .select('*')
      .eq('id', scheduler_id)
      .eq('active', true)
      .single();

    if (schedulerError || !scheduler) {
      throw new Error('Scheduler not found or inactive');
    }

    // Check if slot is already booked
    const { data: existingBooking } = await supabase
      .from('appointments_booked')
      .select('id')
      .eq('scheduler_id', scheduler_id)
      .eq('appointment_date', appointment_date)
      .eq('appointment_time', appointment_time)
      .maybeSingle();

    if (existingBooking) {
      throw new Error('This time slot is already booked');
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('appointments_booked')
      .insert([{
        scheduler_id,
        customer_name,
        customer_email,
        customer_phone,
        appointment_date,
        appointment_time,
        location_type,
        notes,
        status
      }])
      .select()
      .single();

    if (bookingError) {
      console.error('Booking error:', bookingError);
      throw bookingError;
    }

    console.log('Booking created successfully:', booking.id);

    // Send confirmation email to customer
    try {
      await supabase.functions.invoke('send-booking-confirmation', {
        body: {
          booking_id: booking.id,
          customer_email,
          scheduler_name: scheduler.name,
          appointment_date,
          appointment_time,
          location_type: location_type || 'video_call'
        }
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        booking,
        message: 'Booking created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-booking function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
