
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
  video_call_link?: string;
  duration?: number;
}

// Universal variable replacement function - supports both dot notation and snake_case
const replaceVariable = (content: string, variable: string, value: string): string => {
  // Replace dot notation: {{category.property}}
  const dotPattern = new RegExp(`\\{\\{${variable.replace('.', '\\.')}\\}\\}`, 'g');
  // Replace snake_case: {{category_property}}
  const snakePattern = new RegExp(`\\{\\{${variable.replace('.', '_')}\\}\\}`, 'g');
  
  return content.replace(dotPattern, value).replace(snakePattern, value);
};

// Apply all variable replacements to content
const applyReplacements = (content: string, replacements: Record<string, string>): string => {
  let result = content;
  for (const [variable, value] of Object.entries(replacements)) {
    result = replaceVariable(result, variable, value);
  }
  return result;
};

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
      scheduler_id,
      video_call_link,
      duration
    }: BookingConfirmationRequest = await req.json();

    console.log('Sending booking confirmation:', {
      booking_id,
      customer_email,
      appointment_date,
      appointment_time,
      scheduler_id
    });

    // Get scheduler information including user_id for email settings
    const { data: scheduler, error: schedulerError } = await supabase
      .from('appointment_schedulers')
      .select('*, user_email, user_id')
      .eq('id', scheduler_id)
      .single();

    if (schedulerError) {
      console.error('Error fetching scheduler:', schedulerError);
      throw new Error('Scheduler not found');
    }

    console.log('Scheduler user_id for email settings:', scheduler.user_id);

    // Fetch business settings for company info
    const { data: businessSettings } = await supabase
      .from('business_settings')
      .select('*')
      .eq('user_id', scheduler.user_id)
      .maybeSingle();

    // Fetch email settings for signature and from name
    const { data: emailSettings } = await supabase
      .from('email_settings')
      .select('*')
      .eq('user_id', scheduler.user_id)
      .maybeSingle();

    console.log('Business settings found:', !!businessSettings);
    console.log('Email settings found:', !!emailSettings);

    // Get email template for booking confirmation if exists
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', 'booking_confirmation')
      .eq('user_id', scheduler.user_id)
      .eq('active', true)
      .maybeSingle();

    const appointmentDuration = duration || scheduler.duration || 60;
    
    // Build comprehensive replacements map supporting both dot notation and snake_case
    const replacements: Record<string, string> = {
      // Client/Customer variables
      'client.name': customer_name || '',
      'client.email': customer_email || '',
      'customer.name': customer_name || '',
      'customer.email': customer_email || '',
      
      // Appointment variables
      'appointment.date': appointment_date || '',
      'appointment.time': appointment_time || '',
      'appointment.location': businessSettings?.address || scheduler?.locations?.[0]?.address || 'To be confirmed',
      'appointment.type': scheduler?.name || 'Appointment',
      'appointment.duration': appointmentDuration.toString(),
      
      // Duration as standalone
      'duration': appointmentDuration.toString(),
      
      // Company variables
      'company.name': businessSettings?.company_name || scheduler?.name || '',
      'company.phone': businessSettings?.business_phone || '',
      'company.email': businessSettings?.business_email || scheduler?.user_email || '',
      'company.address': businessSettings?.address || '',
      'company.website': businessSettings?.website || '',
      
      // Sender variables
      'sender.name': emailSettings?.from_name || businessSettings?.company_name || '',
      'sender.signature': emailSettings?.signature || `Best regards,\n${businessSettings?.company_name || scheduler?.name || ''}`,
      
      // Video call link
      'video.link': video_call_link || '',
      'meeting.link': video_call_link || '',
    };

    let subject = `Booking Confirmed: ${scheduler.name}`;
    let content = `
      <h2>Your appointment has been confirmed!</h2>
      <p>Dear ${customer_name},</p>
      <p>Thank you for booking an appointment. Here are the details:</p>
      <ul>
        <li><strong>Service:</strong> ${scheduler.name}</li>
        <li><strong>Date:</strong> ${appointment_date}</li>
        <li><strong>Time:</strong> ${appointment_time}</li>
        <li><strong>Duration:</strong> ${appointmentDuration} minutes</li>
        ${video_call_link ? `<li><strong>Video Call Link:</strong> <a href="${video_call_link}">${video_call_link}</a></li>` : ''}
      </ul>
      ${video_call_link ? '<p><a href="' + video_call_link + '" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 16px 0;">Join Video Call</a></p>' : ''}
      <p>If you need to make any changes, please contact us.</p>
      <p>We look forward to meeting with you!</p>
    `;

    if (template) {
      console.log('Using custom email template:', template.id);
      
      // Apply comprehensive variable replacements to template
      subject = applyReplacements(template.subject || subject, replacements);
      content = applyReplacements(template.content || content, replacements);
      
      console.log('Template variables replaced successfully');
    }

    // Send email using existing send-email function with user_id for proper email settings
    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: customer_email,
        subject: subject,
        html: content,
        bookingId: booking_id,
        user_id: scheduler.user_id // Pass scheduler owner's user_id for email settings
      }
    });

    if (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      throw emailError;
    }

    console.log('Booking confirmation email sent successfully to:', customer_email);

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
          html: ownerContent,
          user_id: scheduler.user_id // Pass scheduler owner's user_id for email settings
        }
      });
    }

    // Create in-app notification for the business owner
    if (scheduler.user_id) {
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: scheduler.user_id,
            type: 'info',
            title: 'New Booking Received',
            message: `${customer_name} booked "${scheduler.name}" for ${appointment_date} at ${appointment_time}`,
            category: 'appointment',
            source_type: 'appointment',
            source_id: booking_id,
            action_url: '/?tab=calendar',
          });
      } catch (notifError) {
        console.warn('Failed to create booking in-app notification:', notifError);
      }
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
