import { SendGridSetup } from "@/components/integrations/SendGridSetup";
import { SendGridWebhookDiagnostics } from "./SendGridWebhookDiagnostics";
import { EmailSetupStatusCard } from "@/components/email-setup/EmailSetupStatusCard";

export const SendGridIntegrationTab = () => {
  return (
    <div className="space-y-8">
      <EmailSetupStatusCard />
      <SendGridSetup />
      <SendGridWebhookDiagnostics />
    </div>
  );
};