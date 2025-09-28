
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingConfirmationRequest {
  booking_id: string;
  customer_name: string;
  customer_email: string;
  appointment_date: string;
  appointment_time: string;
  scheduler_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      booking_id,
      customer_name,
      customer_email,
      appointment_date,
      appointment_time,
      scheduler_id
    }: BookingConfirmationRequest = await req.json();

    console.log('Sending booking confirmation:', {
      booking_id,
      customer_email,
      appointment_date,
      appointment_time,
      scheduler_id
    });

    // Get scheduler information
    const { data: scheduler, error: schedulerError } = await supabase
      .from('appointment_schedulers')
      .select('*, user_email')
      .eq('id', scheduler_id)
      .single();

    if (schedulerError) {
      console.error('Error fetching scheduler:', schedulerError);
      throw new Error('Scheduler not found');
    }

    // Get email template for booking confirmation if exists
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', 'booking_confirmation')
      .eq('user_id', scheduler.user_id)
      .eq('active', true)
      .single();

    let subject = `Booking Confirmed: ${scheduler.name}`;
    let content = `
      <h2>Your appointment has been confirmed!</h2>
      <p>Dear ${customer_name},</p>
      <p>Thank you for booking an appointment. Here are the details:</p>
      <ul>
        <li><strong>Service:</strong> ${scheduler.name}</li>
        <li><strong>Date:</strong> ${appointment_date}</li>
        <li><strong>Time:</strong> ${appointment_time}</li>
        <li><strong>Duration:</strong> ${scheduler.duration || 60} minutes</li>
      </ul>
      <p>If you need to make any changes, please contact us.</p>
      <p>We look forward to meeting with you!</p>
    `;

    if (template) {
      subject = template.subject
        .replace('{{customer_name}}', customer_name)
        .replace('{{appointment_date}}', appointment_date)
        .replace('{{appointment_time}}', appointment_time)
        .replace('{{duration}}', scheduler.duration?.toString() || '60')
        .replace('{{company_name}}', scheduler.name);
      
      content = template.content
        .replace(/{{customer_name}}/g, customer_name)
        .replace(/{{appointment_date}}/g, appointment_date)
        .replace(/{{appointment_time}}/g, appointment_time)
        .replace(/{{duration}}/g, scheduler.duration?.toString() || '60')
        .replace(/{{company_name}}/g, scheduler.name);
    }

    // Send email using existing send-email function
    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: customer_email,
        subject: subject,
        html: content,
        bookingId: booking_id
      }
    });

    if (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      throw emailError;
    }

    // Send notification to scheduler owner
    if (scheduler.user_email) {
      const ownerSubject = `New Booking: ${customer_name} - ${appointment_date} at ${appointment_time}`;
      const ownerContent = `
        <h2>New Appointment Booked</h2>
        <p>You have a new appointment booking:</p>
        <ul>
          <li><strong>Customer:</strong> ${customer_name}</li>
          <li><strong>Email:</strong> ${customer_email}</li>
          <li><strong>Date:</strong> ${appointment_date}</li>
          <li><strong>Time:</strong> ${appointment_time}</li>
          <li><strong>Duration:</strong> ${scheduler.duration || 60} minutes</li>
        </ul>
        <p>This appointment has been automatically added to your calendar.</p>
      `;

      await supabase.functions.invoke('send-email', {
        body: {
          to: scheduler.user_email,
          subject: ownerSubject,
          html: ownerContent
        }
      });
    }

    // Schedule reminder emails
    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
    
    // Schedule 24h reminder
    const reminder24h = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
    const reminder10min = new Date(appointmentDateTime.getTime() - 10 * 60 * 1000);

    const reminders = [
      {
        booking_id: booking_id,
        reminder_type: '24h',
        scheduled_for: reminder24h.toISOString(),
        status: 'pending'
      },
      {
        booking_id: booking_id,
        reminder_type: '10min',
        scheduled_for: reminder10min.toISOString(),
        status: 'pending'
      }
    ];

    const { error: reminderError } = await supabase
      .from('email_reminders')
      .insert(reminders);

    if (reminderError) {
      console.error('Failed to schedule reminders:', reminderError);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Confirmation sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-booking-confirmation:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
