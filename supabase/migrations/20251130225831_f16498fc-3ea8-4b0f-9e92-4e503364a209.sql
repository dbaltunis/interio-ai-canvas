-- Create default email templates for users who don't have any
-- This function can be called to seed templates for a user

CREATE OR REPLACE FUNCTION seed_default_email_templates(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only seed if user has no templates yet
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE user_id = target_user_id) THEN
    INSERT INTO email_templates (user_id, template_type, subject, content, variables, active)
    VALUES 
      (
        target_user_id,
        'quote',
        'Quote #{{quote.number}} from {{company.name}}',
        '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
    .content { padding: 20px 0; }
    .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; margin-top: 20px; border-radius: 8px; }
    .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{company.name}}</h1>
      <p>Professional Window Treatment Solutions</p>
    </div>
    <div class="content">
      <h2>Hello {{client.name}},</h2>
      <p>Thank you for your interest! We''ve prepared a detailed quote for your project.</p>
      
      <p><strong>Quote Details:</strong></p>
      <ul>
        <li>Quote Number: {{quote.number}}</li>
        <li>Project: {{project.name}}</li>
        <li>Total: {{quote.total}}</li>
        <li>Valid Until: {{quote.valid_until}}</li>
      </ul>

      <p>Please review the attached quote document. If you have any questions or would like to proceed, we''re here to help!</p>
      
      <center>
        <a href="mailto:{{company.email}}" class="button">Contact Us</a>
      </center>
      
      <p>Best regards,<br>
      {{sender.name}}<br>
      {{company.name}}<br>
      {{company.phone}}</p>
    </div>
    <div class="footer">
      {{sender.signature}}
    </div>
  </div>
</body>
</html>',
        '["client.name", "client.email", "company.name", "company.phone", "company.email", "quote.number", "quote.total", "quote.valid_until", "project.name", "sender.name", "sender.signature"]'::jsonb,
        true
      ),
      (
        target_user_id,
        'booking_confirmation',
        'Appointment Confirmed - {{appointment.date}} at {{appointment.time}}',
        '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px; }
    .content { padding: 20px 0; }
    .appointment-details { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; margin-top: 20px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Appointment Confirmed</h1>
    </div>
    <div class="content">
      <h2>Hello {{client.name}},</h2>
      <p>Your appointment has been confirmed! We look forward to meeting with you.</p>
      
      <div class="appointment-details">
        <h3>Appointment Details:</h3>
        <p><strong>Date:</strong> {{appointment.date}}<br>
        <strong>Time:</strong> {{appointment.time}}<br>
        <strong>Location:</strong> {{appointment.location}}<br>
        <strong>Type:</strong> {{appointment.type}}</p>
      </div>

      <p>If you need to reschedule or have any questions, please contact us at {{company.phone}} or {{company.email}}.</p>
      
      <p>Best regards,<br>
      {{company.name}}</p>
    </div>
    <div class="footer">
      {{sender.signature}}
    </div>
  </div>
</body>
</html>',
        '["client.name", "company.name", "company.phone", "company.email", "appointment.date", "appointment.time", "appointment.location", "appointment.type", "sender.signature"]'::jsonb,
        true
      ),
      (
        target_user_id,
        'reminder',
        'Reminder: Appointment Tomorrow at {{appointment.time}}',
        '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px; }
    .content { padding: 20px 0; }
    .reminder { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; margin-top: 20px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Appointment Reminder</h1>
    </div>
    <div class="content">
      <h2>Hello {{client.name}},</h2>
      
      <div class="reminder">
        <p><strong>This is a friendly reminder about your appointment tomorrow:</strong></p>
        <p>Date: {{appointment.date}}<br>
        Time: {{appointment.time}}<br>
        Location: {{appointment.location}}</p>
      </div>

      <p>We look forward to seeing you! If you need to make any changes, please contact us as soon as possible.</p>
      
      <p>Best regards,<br>
      {{company.name}}<br>
      {{company.phone}}</p>
    </div>
    <div class="footer">
      {{sender.signature}}
    </div>
  </div>
</body>
</html>',
        '["client.name", "company.name", "company.phone", "appointment.date", "appointment.time", "appointment.location", "sender.signature"]'::jsonb,
        true
      ),
      (
        target_user_id,
        'thank_you',
        'Thank You for Your Business, {{client.name}}!',
        '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; border-radius: 8px; }
    .content { padding: 20px 0; }
    .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; margin-top: 20px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You! 🎉</h1>
    </div>
    <div class="content">
      <h2>Dear {{client.name}},</h2>
      <p>Thank you for choosing {{company.name}} for your window treatment needs. We truly appreciate your business!</p>
      
      <p>We hope you''re delighted with your new {{project.name}}. Your satisfaction is our top priority.</p>

      <p>If you have any questions or need anything in the future, please don''t hesitate to reach out. We''re always here to help!</p>

      <p><strong>We''d love your feedback!</strong> If you''re happy with our service, we''d be grateful if you could share your experience with others.</p>
      
      <p>Warmest regards,<br>
      {{sender.name}}<br>
      {{company.name}}<br>
      {{company.phone}} | {{company.email}}</p>
    </div>
    <div class="footer">
      {{sender.signature}}
    </div>
  </div>
</body>
</html>',
        '["client.name", "company.name", "company.phone", "company.email", "project.name", "sender.name", "sender.signature"]'::jsonb,
        true
      );
  END IF;
END;
$$;