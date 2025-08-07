import React from 'react';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useEnhancedEmailSettings } from '@/hooks/useEnhancedEmailSettings';
import { SafeHTML } from '@/utils/htmlSanitizer';

interface EmailTemplateWithBusinessProps {
  subject: string;
  content: string;
  clientData?: {
    name: string;
    email: string;
    company_name?: string;
  };
  quoteData?: {
    quote_number: string;
    total_amount: number;
    status: string;
  };
}

export const EmailTemplateWithBusiness = ({
  subject,
  content,
  clientData,
  quoteData,
}: EmailTemplateWithBusinessProps) => {
  const { data: businessSettings } = useBusinessSettings();
  const { getEmailSignature, getFromName } = useEnhancedEmailSettings();

  const processTemplate = (text: string) => {
    if (!text) return '';

    let processed = text;

    // Replace client variables
    if (clientData) {
      processed = processed.replace(/\{\{client\.name\}\}/g, clientData.name);
      processed = processed.replace(/\{\{client\.email\}\}/g, clientData.email);
      processed = processed.replace(/\{\{client\.company\}\}/g, clientData.company_name || '');
    }

    // Replace quote variables
    if (quoteData) {
      processed = processed.replace(/\{\{quote\.number\}\}/g, quoteData.quote_number);
      processed = processed.replace(/\{\{quote\.amount\}\}/g, `$${quoteData.total_amount.toFixed(2)}`);
      processed = processed.replace(/\{\{quote\.status\}\}/g, quoteData.status);
    }

    // Replace business variables
    if (businessSettings) {
      processed = processed.replace(/\{\{company\.name\}\}/g, businessSettings.company_name || 'Your Company');
      processed = processed.replace(/\{\{company\.phone\}\}/g, businessSettings.business_phone || '');
      processed = processed.replace(/\{\{company\.email\}\}/g, businessSettings.business_email || '');
      processed = processed.replace(/\{\{company\.website\}\}/g, businessSettings.website || '');
      processed = processed.replace(/\{\{company\.address\}\}/g, businessSettings.address || '');
    }

    // Replace sender variables
    processed = processed.replace(/\{\{sender\.name\}\}/g, getFromName());

    return processed;
  };

  const processedSubject = processTemplate(subject);
  const processedContent = processTemplate(content);
  const signature = getEmailSignature();

  return (
    <div className="email-template bg-white border rounded-lg shadow-sm">
      {/* Email Header */}
      <div className="border-b p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {businessSettings?.company_logo_url && (
              <img 
                src={businessSettings.company_logo_url} 
                alt="Company Logo" 
                className="h-8 w-8 object-contain"
              />
            )}
            <div>
              <p className="font-medium">{getFromName()}</p>
              <p className="text-sm text-gray-600">From: {businessSettings?.business_email}</p>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <p className="font-semibold text-lg">{processedSubject}</p>
        </div>
      </div>

      {/* Email Body */}
      <div className="p-6">
        <SafeHTML 
          className="prose max-w-none"
          html={processedContent.replace(/\n/g, '<br/>')}
        />
        
        {/* Email Signature */}
        <div className="mt-6 pt-4 border-t">
          <SafeHTML 
            className="text-gray-600 whitespace-pre-line"
            html={signature.replace(/\n/g, '<br/>')}
          />
        </div>
      </div>

      {/* Business Footer */}
      {businessSettings && (
        <div className="border-t p-4 bg-gray-50 text-center text-sm text-gray-600">
          {businessSettings.company_name && (
            <p className="font-medium">{businessSettings.company_name}</p>
          )}
          <div className="flex justify-center gap-4 mt-1">
            {businessSettings.business_phone && <span>📞 {businessSettings.business_phone}</span>}
            {businessSettings.business_email && <span>✉️ {businessSettings.business_email}</span>}
            {businessSettings.website && <span>🌐 {businessSettings.website}</span>}
          </div>
          {businessSettings.address && (
            <p className="mt-1">
              📍 {businessSettings.address}
              {businessSettings.city && `, ${businessSettings.city}`}
              {businessSettings.state && `, ${businessSettings.state}`} 
              {businessSettings.zip_code && ` ${businessSettings.zip_code}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};