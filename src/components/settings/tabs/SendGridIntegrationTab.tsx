import { SendGridIntegrationTab } from "./SendGridIntegrationTab";
import { SendGridWebhookDiagnostics } from "./SendGridWebhookDiagnostics";

export const SendGridIntegrationTab = () => {
  return (
    <div className="space-y-8">
      <SendGridIntegrationTab />
      <SendGridWebhookDiagnostics />
    </div>
  );
};