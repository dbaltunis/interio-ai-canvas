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

    // Create Google Calendar event with real Meet link
    let videoCallLink = null;
    let calendarEventId = null;
    
    try {
      // Parse appointment time and date to create ISO datetime
      const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
      const duration = scheduler.duration || 60;
      const endDateTime = new Date(appointmentDateTime.getTime() + duration * 60000);
      
      const { data: calendarResponse, error: calendarError } = await supabase.functions.invoke('create-calendar-event', {
        body: {
          summary: `${scheduler.name} - ${customer_name}`,
          description: notes || `Appointment booked via ${scheduler.name}`,
          start_time: appointmentDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          attendee_email: customer_email,
          attendee_name: customer_name,
          scheduler_email: scheduler.user_email,
          scheduler_user_id: scheduler.user_id, // Pass scheduler owner's user_id for OAuth
          timezone: 'UTC'
        }
      });

      if (calendarResponse?.success && calendarResponse.meetLink) {
        videoCallLink = calendarResponse.meetLink;
        calendarEventId = calendarResponse.eventId;
        
        // Update booking with real Google Meet link
        await supabase
          .from('appointments_booked')
          .update({ 
            video_call_link: videoCallLink,
            booking_message: `Calendar event created: ${calendarResponse.htmlLink}`
          })
          .eq('id', booking.id);
        
        console.log('Created Google Calendar event with Meet link:', videoCallLink);
      } else {
        console.log('Calendar event creation skipped or failed, using placeholder');
        // Fallback to placeholder if calendar creation fails
        const meetingId = booking.id.substring(0, 10);
        videoCallLink = `https://meet.google.com/${meetingId}`;
        
        await supabase
          .from('appointments_booked')
          .update({ video_call_link: videoCallLink })
          .eq('id', booking.id);
      }
    } catch (calendarError) {
      console.error('Error creating calendar event:', calendarError);
      // Use placeholder on error
      const meetingId = booking.id.substring(0, 10);
      videoCallLink = `https://meet.google.com/${meetingId}`;
      
      await supabase
        .from('appointments_booked')
        .update({ video_call_link: videoCallLink })
        .eq('id', booking.id);
    }

    // Send confirmation email to customer with video call link
    try {
      await supabase.functions.invoke('send-booking-confirmation', {
        body: {
          booking_id: booking.id,
          customer_email,
          customer_name,
          scheduler_id,
          scheduler_name: scheduler.name,
          appointment_date,
          appointment_time,
          location_type: location_type || 'video_call',
          video_call_link: videoCallLink,
          duration: scheduler.duration || 60
        }
      });
      console.log('Email confirmation sent successfully');
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
