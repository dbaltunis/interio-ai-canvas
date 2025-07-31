import { useEmailSettings } from './useEmailSettings';
import { useBusinessSettings } from './useBusinessSettings';

export const useEnhancedEmailSettings = () => {
  const { data: emailSettings, ...emailQuery } = useEmailSettings();
  const { data: businessSettings } = useBusinessSettings();

  const getEmailSignature = () => {
    if (emailSettings?.signature) {
      return emailSettings.signature;
    }

    // Generate default signature from business settings
    if (businessSettings) {
      let signature = `\n\nBest regards,\n`;
      
      if (businessSettings.company_name) {
        signature += `${businessSettings.company_name}\n`;
      }
      
      if (businessSettings.business_phone) {
        signature += `Phone: ${businessSettings.business_phone}\n`;
      }
      
      if (businessSettings.business_email) {
        signature += `Email: ${businessSettings.business_email}\n`;
      }
      
      if (businessSettings.website) {
        signature += `Website: ${businessSettings.website}\n`;
      }

      return signature;
    }

    return '\n\nBest regards,\nYour Company';
  };

  const getFromEmail = () => {
    return emailSettings?.from_email || businessSettings?.business_email || 'noreply@company.com';
  };

  const getFromName = () => {
    return emailSettings?.from_name || businessSettings?.company_name || 'Your Company';
  };

  const getReplyToEmail = () => {
    return emailSettings?.reply_to_email || businessSettings?.business_email || getFromEmail();
  };

  return {
    ...emailQuery,
    data: emailSettings,
    businessSettings,
    getEmailSignature,
    getFromEmail,
    getFromName,
    getReplyToEmail,
  };
};