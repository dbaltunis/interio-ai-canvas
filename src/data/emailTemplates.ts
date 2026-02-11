export interface EmailTemplateData {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_type: 'quote_followup' | 'installation_reminder' | 'thank_you' | 'promotional' | 'custom' | 'welcome' | 'consultation' | 'measurement' | 'payment_reminder' | 'referral' | 'review_request' | 'project_complete' | 'reengagement';
  variables: string[];
  category: string;
  description: string;
}

export const predefinedEmailTemplates: EmailTemplateData[] = [
  {
    id: 'fabric-collection-followup',
    name: 'New Fabric Collection Follow-up',
    subject: 'Exciting New Fabric Collections Just Arrived! 🎨',
    template_type: 'promotional',
    category: 'Product Updates',
    description: 'Follow up with clients about new fabric collections',
    variables: ['client_name', 'company_name', 'fabric_collection_name'],
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px;">{{company_name}}</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #2c5530, #8fbc8f); margin-bottom: 20px;"></div>
        </div>
        
        <h2 style="color: #2c5530;">Hello {{client_name}},</h2>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          We're thrilled to announce the arrival of our stunning new fabric collection: <strong>{{fabric_collection_name}}</strong>!
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5530; margin-top: 0;">What's New:</h3>
          <ul style="color: #333; line-height: 1.6;">
            <li>Premium quality fabrics from renowned designers</li>
            <li>Fresh patterns and contemporary colors</li>
            <li>Perfect for modern interior design trends</li>
            <li>Available in various textures and finishes</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Given your excellent taste in interior design, I thought you'd appreciate seeing these new options for your upcoming projects.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Schedule a Consultation
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Best regards,<br>
          The {{company_name}} Team
        </p>
      </div>
    `
  },
  {
    id: 'quote-followup',
    name: 'Quote Follow-up for Non-Responsive Leads',
    subject: 'Following up on your window treatment quote',
    template_type: 'quote_followup',
    category: 'Sales Follow-up',
    description: 'Follow up with leads who haven\'t responded to quotes',
    variables: ['client_name', 'quote_number', 'quote_amount', 'company_name'],
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px;">{{company_name}}</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #2c5530, #8fbc8f); margin-bottom: 20px;"></div>
        </div>
        
        <h2 style="color: #2c5530;">Hi {{client_name}},</h2>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          I hope this email finds you well. I wanted to follow up on the quote we prepared for your window treatment project.
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2c5530;">
          <h3 style="color: #2c5530; margin-top: 0;">Quote Summary:</h3>
          <p style="margin: 5px 0; color: #333;"><strong>Quote #:</strong> {{quote_number}}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Total:</strong> $\{{quote_amount}}</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          I understand that choosing the right window treatments is an important decision. If you have any questions about the quote or would like to discuss alternative options, I'm here to help.
        </p>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #2c5530; font-weight: bold;">
            💡 Special Offer: Schedule a consultation this week and receive 10% off your first order!
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
            Accept Quote
          </a>
          <a href="#" style="background: transparent; color: #2c5530; padding: 15px 30px; text-decoration: none; border-radius: 5px; border: 2px solid #2c5530; font-weight: bold;">
            Schedule Call
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Looking forward to hearing from you!<br><br>
          Best regards,<br>
          The {{company_name}} Team
        </p>
      </div>
    `
  },
  {
    id: 'post-installation-thankyou',
    name: 'Post-Installation Thank You',
    subject: 'Thank you for choosing us for your window treatments! 🏡',
    template_type: 'thank_you',
    category: 'Customer Care',
    description: 'Thank you message after installation completion',
    variables: ['client_name', 'company_name', 'installation_date', 'project_name'],
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px;">Thank You! 🎉</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #2c5530, #8fbc8f); margin-bottom: 20px;"></div>
        </div>
        
        <h2 style="color: #2c5530;">Dear {{client_name}},</h2>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Thank you for choosing {{company_name}} for your window treatment project! We hope you're absolutely delighted with your new {{project_name}}.
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5530; margin-top: 0;">Installation Completed:</h3>
          <p style="margin: 5px 0; color: #333;"><strong>Date:</strong> {{installation_date}}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Project:</strong> {{project_name}}</p>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5530; margin-top: 0;">Care Instructions:</h3>
          <ul style="color: #333; line-height: 1.6; margin: 10px 0;">
            <li>Regular dusting with a soft brush or vacuum with upholstery attachment</li>
            <li>Spot clean stains immediately with mild soap and water</li>
            <li>Professional cleaning recommended annually for best results</li>
            <li>Avoid harsh chemicals or bleach</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Your satisfaction is our top priority. If you have any questions or concerns about your new window treatments, please don't hesitate to reach out.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
            Leave a Review
          </a>
          <a href="#" style="background: transparent; color: #2c5530; padding: 15px 30px; text-decoration: none; border-radius: 5px; border: 2px solid #2c5530; font-weight: bold;">
            Refer a Friend
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Thank you again for your trust in {{company_name}}!<br><br>
          Warm regards,<br>
          The {{company_name}} Team
        </p>
      </div>
    `
  },
  {
    id: 'installation-reminder',
    name: 'Installation Appointment Reminder',
    subject: 'Reminder: Installation scheduled for {{installation_date}}',
    template_type: 'installation_reminder',
    category: 'Appointments',
    description: 'Reminder for upcoming installation appointments',
    variables: ['client_name', 'installation_date', 'installation_time', 'company_name', 'installer_name'],
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px;">Installation Reminder 📅</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #2c5530, #8fbc8f); margin-bottom: 20px;"></div>
        </div>
        
        <h2 style="color: #2c5530;">Hello {{client_name}},</h2>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          This is a friendly reminder about your upcoming window treatment installation.
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2c5530;">
          <h3 style="color: #2c5530; margin-top: 0;">Installation Details:</h3>
          <p style="margin: 5px 0; color: #333;"><strong>Date:</strong> {{installation_date}}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Time:</strong> {{installation_time}}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Installer:</strong> {{installer_name}}</p>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0;">Please Prepare:</h3>
          <ul style="color: #856404; line-height: 1.6; margin: 10px 0;">
            <li>Clear the area around windows</li>
            <li>Remove any existing window treatments</li>
            <li>Ensure easy access to power outlets if needed</li>
            <li>Have pets secured in another room</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Our installer will arrive during the scheduled time window. The installation typically takes 2-4 hours depending on the complexity of your project.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
            Confirm Appointment
          </a>
          <a href="#" style="background: transparent; color: #dc3545; padding: 15px 30px; text-decoration: none; border-radius: 5px; border: 2px solid #dc3545; font-weight: bold;">
            Reschedule
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          If you have any questions or need to make changes, please contact us immediately.<br><br>
          Best regards,<br>
          The {{company_name}} Team
        </p>
      </div>
    `
  },
  {
    id: 'seasonal-promotion',
    name: 'Seasonal Promotion Campaign',
    subject: 'Exclusive {{season}} Offer: Transform Your Home! 🍂',
    template_type: 'promotional',
    category: 'Seasonal Marketing',
    description: 'Seasonal promotional campaign for special offers',
    variables: ['client_name', 'company_name', 'season', 'discount_percentage', 'offer_expires'],
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px;">{{season}} Special Offer! 🎉</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #2c5530, #8fbc8f); margin-bottom: 20px;"></div>
        </div>
        
        <h2 style="color: #2c5530;">Dear {{client_name}},</h2>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          As {{season}} approaches, it's the perfect time to refresh your home with beautiful new window treatments!
        </p>
        
        <div style="background: linear-gradient(135deg, #2c5530, #8fbc8f); color: white; padding: 30px; border-radius: 15px; text-align: center; margin: 20px 0;">
          <h2 style="margin: 0; font-size: 28px;">{{discount_percentage}}% OFF</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px;">All Window Treatments</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5530; margin-top: 0;">This Exclusive Offer Includes:</h3>
          <ul style="color: #333; line-height: 1.6;">
            <li>Free in-home consultation and measurement</li>
            <li>Premium fabric selection from top designers</li>
            <li>Professional installation included</li>
            <li>2-year warranty on all products</li>
            <li>Flexible payment options available</li>
          </ul>
        </div>
        
        <div style="background: #dc3545; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-weight: bold; font-size: 16px;">
            ⏰ Limited Time Offer - Expires {{offer_expires}}
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Whether you're looking for elegant drapes, modern blinds, or functional shutters, we have the perfect solution to enhance your home's beauty and comfort.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #2c5530; color: white; padding: 18px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Schedule Free Consultation
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center; font-style: italic;">
          "Transform your home with {{company_name}} - where quality meets style"
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          Best regards,<br>
          The {{company_name}} Team
        </p>
      </div>
    `
  },
  {
    id: 'welcome-onboarding',
    name: 'Welcome & Onboarding',
    subject: 'Welcome to {{company_name}}! Let\'s Get Started',
    template_type: 'welcome',
    category: 'Customer Care',
    description: 'Welcome email for new clients with next steps',
    variables: ['client_name', 'company_name'],
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px;">Welcome to {{company_name}}!</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #2c5530, #8fbc8f); margin-bottom: 20px;"></div>
        </div>
        <h2 style="color: #2c5530;">Hello {{client_name}},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Thank you for choosing {{company_name}} for your window treatment needs. We're excited to help transform your space!
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5530; margin-top: 0;">Here's What Happens Next:</h3>
          <ol style="color: #333; line-height: 1.8;">
            <li><strong>Free Consultation</strong> - We'll discuss your vision and preferences</li>
            <li><strong>In-Home Measurement</strong> - Our expert measures your windows precisely</li>
            <li><strong>Custom Quote</strong> - You'll receive a detailed proposal</li>
            <li><strong>Professional Installation</strong> - Sit back while we handle everything</li>
          </ol>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Book Your Consultation
          </a>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Looking forward to working with you!<br><br>
          Warm regards,<br>
          The {{company_name}} Team
        </p>
      </div>
    `
  },
  {
    id: 'consultation-followup',
    name: 'Consultation Follow-up',
    subject: 'Great meeting you! Here\'s a summary of our consultation',
    template_type: 'consultation',
    category: 'Sales Follow-up',
    description: 'Follow-up after an in-home or virtual consultation',
    variables: ['client_name', 'company_name'],
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px;">{{company_name}}</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #2c5530, #8fbc8f); margin-bottom: 20px;"></div>
        </div>
        <h2 style="color: #2c5530;">Hi {{client_name}},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          It was wonderful meeting with you today! I really enjoyed discussing your window treatment ideas and I'm excited about the direction we're heading.
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5530; margin-top: 0;">What We Discussed:</h3>
          <ul style="color: #333; line-height: 1.6;">
            <li>Your style preferences and inspiration</li>
            <li>Fabric and material options that suit your space</li>
            <li>Measurements and window specifications</li>
            <li>Budget considerations and timeline</li>
          </ul>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          I'll have your personalized quote ready within the next 24-48 hours. In the meantime, don't hesitate to reach out if you have any questions or additional thoughts.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Your Project
          </a>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Thank you for your time!<br><br>
          Best regards,<br>
          The {{company_name}} Team
        </p>
      </div>
    `
  },
  {
    id: 'measurement-confirmation',
    name: 'Measurement Appointment Confirmation',
    subject: 'Your measurement appointment is confirmed!',
    template_type: 'measurement',
    category: 'Appointments',
    description: 'Confirmation email for scheduled measurement appointments',
    variables: ['client_name', 'company_name', 'appointment_date', 'appointment_time'],
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px;">Appointment Confirmed</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #2c5530, #8fbc8f); margin-bottom: 20px;"></div>
        </div>
        <h2 style="color: #2c5530;">Hello {{client_name}},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Your measurement appointment has been confirmed. We look forward to visiting your home!
        </p>
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2c5530;">
          <h3 style="color: #2c5530; margin-top: 0;">Appointment Details:</h3>
          <p style="margin: 8px 0; color: #333; font-size: 16px;"><strong>Date:</strong> {{appointment_date}}</p>
          <p style="margin: 8px 0; color: #333; font-size: 16px;"><strong>Time:</strong> {{appointment_time}}</p>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #333; font-size: 14px;">
            <strong>Tip:</strong> No need to prepare anything special. Our consultant will handle all measurements and discuss options on-site.
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
            Add to Calendar
          </a>
          <a href="#" style="background: transparent; color: #dc3545; padding: 15px 30px; text-decoration: none; border-radius: 5px; border: 2px solid #dc3545; font-weight: bold;">
            Reschedule
          </a>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          See you soon!<br><br>
          Best regards,<br>
          The {{company_name}} Team
        </p>
      </div>
    `
  },
  {
    id: 'payment-reminder',
    name: 'Payment Reminder',
    subject: 'Payment reminder for your window treatment order',
    template_type: 'payment_reminder',
    category: 'Administrative',
    description: 'Gentle payment reminder for outstanding invoices',
    variables: ['client_name', 'company_name', 'invoice_amount', 'due_date'],
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px;">{{company_name}}</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #2c5530, #8fbc8f); margin-bottom: 20px;"></div>
        </div>
        <h2 style="color: #2c5530;">Hi {{client_name}},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          This is a friendly reminder about an upcoming payment for your window treatment order.
        </p>
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0;">Payment Details:</h3>
          <p style="margin: 8px 0; color: #333;"><strong>Amount Due:</strong> ${{invoice_amount}}</p>
          <p style="margin: 8px 0; color: #333;"><strong>Due Date:</strong> {{due_date}}</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          If you've already made this payment, please disregard this reminder. If you have any questions about your invoice, please don't hesitate to reach out.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Make Payment
          </a>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Thank you for your business!<br><br>
          Best regards,<br>
          The {{company_name}} Team
        </p>
      </div>
    `
  },
  {
    id: 'referral-request',
    name: 'Referral Request',
    subject: 'Love your new window treatments? Share the love!',
    template_type: 'referral',
    category: 'Customer Care',
    description: 'Ask satisfied clients to refer friends and family',
    variables: ['client_name', 'company_name'],
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px;">{{company_name}}</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #2c5530, #8fbc8f); margin-bottom: 20px;"></div>
        </div>
        <h2 style="color: #2c5530;">Hi {{client_name}},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          We hope you're enjoying your beautiful new window treatments! We'd love it if you could help us spread the word.
        </p>
        <div style="background: linear-gradient(135deg, #2c5530, #8fbc8f); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 20px;">Refer a Friend, Get Rewarded</h3>
          <p style="margin: 0; font-size: 15px; opacity: 0.9;">
            When your referral places an order, you'll both receive a special thank-you discount on your next project.
          </p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Know someone who's been thinking about updating their home? Simply share our name and we'll take excellent care of them - just like we did for you.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Refer a Friend
          </a>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Thank you for being a valued client!<br><br>
          Warm regards,<br>
          The {{company_name}} Team
        </p>
      </div>
    `
  },
  {
    id: 'review-request',
    name: 'Review & Testimonial Request',
    subject: 'How did we do? We\'d love your feedback!',
    template_type: 'review_request',
    category: 'Customer Care',
    description: 'Request reviews from satisfied clients',
    variables: ['client_name', 'company_name'],
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px;">{{company_name}}</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #2c5530, #8fbc8f); margin-bottom: 20px;"></div>
        </div>
        <h2 style="color: #2c5530;">Hi {{client_name}},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          We hope you're loving your new window treatments! Your feedback means the world to us and helps other homeowners find the right solution for their homes.
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: #333; font-size: 16px; margin: 0 0 15px 0;">
            Would you mind taking a moment to share your experience?
          </p>
          <p style="color: #ffc107; font-size: 28px; margin: 0; letter-spacing: 5px;">
            &#9733; &#9733; &#9733; &#9733; &#9733;
          </p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          A quick review takes just a minute and helps us continue providing exceptional service to homeowners like yourself.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Leave a Review
          </a>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Thank you so much!<br><br>
          Best regards,<br>
          The {{company_name}} Team
        </p>
      </div>
    `
  },
  {
    id: 'project-completion',
    name: 'Project Completion Summary',
    subject: 'Your project is complete! Here\'s a summary',
    template_type: 'project_complete',
    category: 'Administrative',
    description: 'Summary email after a project is fully completed',
    variables: ['client_name', 'company_name', 'project_name'],
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px;">Project Complete!</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #2c5530, #8fbc8f); margin-bottom: 20px;"></div>
        </div>
        <h2 style="color: #2c5530;">Dear {{client_name}},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          We're pleased to confirm that your project <strong>{{project_name}}</strong> has been completed! It was a pleasure working with you.
        </p>
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5530; margin-top: 0;">Your Warranty Coverage:</h3>
          <ul style="color: #333; line-height: 1.6;">
            <li>Product warranty as per manufacturer terms</li>
            <li>Installation workmanship warranty included</li>
            <li>Contact us anytime for adjustments or service</li>
          </ul>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          We stand behind our work and are always here if you need any adjustments or have questions about care and maintenance.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
            View Project Details
          </a>
          <a href="#" style="background: transparent; color: #2c5530; padding: 15px 30px; text-decoration: none; border-radius: 5px; border: 2px solid #2c5530; font-weight: bold;">
            Leave a Review
          </a>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Thank you for choosing {{company_name}}!<br><br>
          Warm regards,<br>
          The {{company_name}} Team
        </p>
      </div>
    `
  },
  {
    id: 're-engagement',
    name: 'Re-engagement Campaign',
    subject: 'We miss you, {{client_name}}! Let\'s catch up',
    template_type: 'reengagement',
    category: 'Sales Follow-up',
    description: 'Re-engage clients who haven\'t been in touch for a while',
    variables: ['client_name', 'company_name'],
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px;">{{company_name}}</h1>
          <div style="height: 3px; background: linear-gradient(90deg, #2c5530, #8fbc8f); margin-bottom: 20px;"></div>
        </div>
        <h2 style="color: #2c5530;">Hi {{client_name}},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          It's been a while since we last connected, and we wanted to check in. Whether you're thinking about updating your existing window treatments or exploring new possibilities for another room, we're here to help.
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5530; margin-top: 0;">What's New at {{company_name}}:</h3>
          <ul style="color: #333; line-height: 1.6;">
            <li>New fabric collections and designs</li>
            <li>Smart motorized blinds and shades</li>
            <li>Energy-efficient window solutions</li>
            <li>Updated styling trends for modern interiors</li>
          </ul>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          As a valued past client, we'd love to offer you a complimentary consultation to explore what's possible for your home.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Book Free Consultation
          </a>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Hope to hear from you soon!<br><br>
          Best regards,<br>
          The {{company_name}} Team
        </p>
      </div>
    `
  }
];