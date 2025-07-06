import { SendGridSetup } from "@/components/integrations/SendGridSetup";
import { SendGridWebhookDiagnostics } from "./SendGridWebhookDiagnostics";

export const SendGridIntegrationTab = () => {
  return (
    <div className="space-y-8">
      <SendGridSetup />
      <SendGridWebhookDiagnostics />
    </div>
  );
};