
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingConfirmationRequest {
  bookingId: string;
  schedulerName: string;
  customerName: string;
  customerEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  timezone: string;
  locationType: string;
  customMessage?: string;
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
      bookingId,
      schedulerName,
      customerName,
      customerEmail,
      appointmentDate,
      appointmentTime,
      timezone,
      locationType,
      customMessage
    }: BookingConfirmationRequest = await req.json();

    console.log('Sending booking confirmation:', {
      bookingId,
      customerEmail,
      appointmentDate,
      appointmentTime
    });

    // Get email template for booking confirmation if exists
    const { data: template } = await supabase
      .from('email_templates_scheduler')
      .select('*')
      .eq('template_type', 'booking_confirmation')
      .eq('active', true)
      .single();

    let subject = `Booking Confirmed: ${schedulerName}`;
    let content = `
      <h2>Your appointment has been confirmed!</h2>
      <p>Dear ${customerName},</p>
      <p>Thank you for booking an appointment. Here are the details:</p>
      <ul>
        <li><strong>Service:</strong> ${schedulerName}</li>
        <li><strong>Date:</strong> ${appointmentDate}</li>
        <li><strong>Time:</strong> ${appointmentTime} (${timezone})</li>
        <li><strong>Location:</strong> ${locationType}</li>
      </ul>
      ${customMessage ? `<p><strong>Additional information:</strong> ${customMessage}</p>` : ''}
      <p>If you need to make any changes, please contact us.</p>
      <p>We look forward to meeting with you!</p>
    `;

    if (template) {
      subject = template.subject
        .replace('{{schedulerName}}', schedulerName)
        .replace('{{customerName}}', customerName);
      
      content = template.content
        .replace('{{customerName}}', customerName)
        .replace('{{schedulerName}}', schedulerName)
        .replace('{{appointmentDate}}', appointmentDate)
        .replace('{{appointmentTime}}', appointmentTime)
        .replace('{{timezone}}', timezone)
        .replace('{{locationType}}', locationType)
        .replace('{{customMessage}}', customMessage || '');
    }

    // Send email using existing send-email function
    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: customerEmail,
        subject: subject,
        html: content,
        bookingId: bookingId
      }
    });

    if (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      throw emailError;
    }

    // Schedule reminder emails
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    
    // Schedule 24h reminder
    const reminder24h = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
    const reminder10min = new Date(appointmentDateTime.getTime() - 10 * 60 * 1000);

    const reminders = [
      {
        booking_id: bookingId,
        reminder_type: '24h',
        scheduled_for: reminder24h.toISOString(),
        status: 'pending'
      },
      {
        booking_id: bookingId,
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
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
