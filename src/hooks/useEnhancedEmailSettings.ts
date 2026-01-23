import { useEmailSettings } from './useEmailSettings';
import { useBusinessSettings } from './useBusinessSettings';
import { useCurrentUserProfile } from './useUserProfile';

export const useEnhancedEmailSettings = () => {
  const { data: emailSettings, ...emailQuery } = useEmailSettings();
  const { data: businessSettings } = useBusinessSettings();
  const { data: profile } = useCurrentUserProfile();

  const getEmailSignature = () => {
    // If auto-signature is explicitly disabled, return custom signature or empty string
    if (emailSettings?.use_auto_signature === false) {
      return emailSettings.signature || '';
    }

    // Auto-signature is enabled (default) - generate from business settings
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

  const shouldShowFooter = () => {
    // Default to true if not set, otherwise respect the setting
    return emailSettings?.show_footer !== false;
  };

  const isTeamMember = profile?.parent_account_id && profile.parent_account_id !== profile.user_id;
  const isInheritingSettings = isTeamMember && !!emailSettings && emailSettings.user_id !== profile?.user_id;

  return {
    ...emailQuery,
    data: emailSettings,
    businessSettings,
    getEmailSignature,
    getFromEmail,
    getFromName,
    getReplyToEmail,
    shouldShowFooter,
    isTeamMember,
    isInheritingSettings,
  };
};