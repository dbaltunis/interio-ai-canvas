/**
 * Process email template variables with actual data
 * Replaces {{variable.name}} with real values
 */

interface TemplateData {
  client?: {
    name?: string;
    email?: string;
  };
  company?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  quote?: {
    number?: string;
    total?: string;
    valid_until?: string;
  };
  project?: {
    name?: string;
  };
  appointment?: {
    date?: string;
    time?: string;
    location?: string;
    type?: string;
  };
  sender?: {
    name?: string;
    signature?: string;
  };
}

export const processTemplateVariables = (
  template: string,
  data: TemplateData
): string => {
  let processed = template;

  // Replace all {{variable.property}} patterns
  const regex = /\{\{([^}]+)\}\}/g;
  
  processed = processed.replace(regex, (match, variable) => {
    const parts = variable.trim().split('.');
    
    if (parts.length !== 2) return match;
    
    const [category, property] = parts;
    
    // Navigate through the data object
    const value = data[category as keyof TemplateData]?.[property as any];
    
    // Return the value or the original placeholder if not found
    return value !== undefined ? String(value) : match;
  });

  return processed;
};

/**
 * Get available variables for a template type
 */
export const getAvailableVariables = (templateType: string): string[] => {
  const commonVariables = [
    'client.name',
    'client.email',
    'company.name',
    'company.phone',
    'company.email',
    'sender.name',
    'sender.signature',
  ];

  const typeSpecificVariables: Record<string, string[]> = {
    quote: [
      ...commonVariables,
      'quote.number',
      'quote.total',
      'quote.valid_until',
      'project.name',
    ],
    booking_confirmation: [
      ...commonVariables,
      'appointment.date',
      'appointment.time',
      'appointment.location',
      'appointment.type',
    ],
    reminder: [
      ...commonVariables,
      'appointment.date',
      'appointment.time',
      'appointment.location',
    ],
    thank_you: [
      ...commonVariables,
      'project.name',
    ],
    lead_initial_contact: [
      ...commonVariables,
    ],
  };

  return typeSpecificVariables[templateType] || commonVariables;
};

/**
 * Get human-readable label for template type
 */
export const getTemplateTypeLabel = (templateType: string): string => {
  const labels: Record<string, string> = {
    quote: 'Quote Email',
    booking_confirmation: 'Booking Confirmation',
    reminder: 'Appointment Reminder',
    thank_you: 'Thank You Email',
    lead_initial_contact: 'Lead Initial Contact',
  };

  return labels[templateType] || templateType;
};

/**
 * Get example data for template preview
 */
export const getExampleTemplateData = (): TemplateData => {
  return {
    client: {
      name: 'John Smith',
      email: 'john.smith@example.com',
    },
    company: {
      name: 'Your Business Name',
      phone: '(555) 123-4567',
      email: 'info@yourbusiness.com',
    },
    quote: {
      number: 'Q-2024-001',
      total: '$2,450.00',
      valid_until: 'December 31, 2024',
    },
    project: {
      name: 'Living Room Window Treatments',
    },
    appointment: {
      date: 'Tomorrow, December 2nd',
      time: '2:00 PM',
      location: '123 Main St, Your City',
      type: 'Consultation',
    },
    sender: {
      name: 'Your Name',
      signature: 'Best regards,\nYour Business Team',
    },
  };
};
