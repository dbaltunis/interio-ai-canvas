
export interface EmailTemplateData {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_type: 'quote_followup' | 'installation_reminder' | 'thank_you' | 'promotional' | 'custom';
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
          <p style="margin: 5px 0; color: #333;"><strong>Total:</strong> ${{quote_amount}}</p>
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
  }
];
