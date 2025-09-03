import { SendGridSetup } from "@/components/integrations/SendGridSetup";
import { SendGridWebhookDiagnostics } from "./SendGridWebhookDiagnostics";
import { EmailSetupStatusCard } from "@/components/email-setup/EmailSetupStatusCard";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, AlertCircle } from "lucide-react";

export const SendGridIntegrationTab = () => {
  const { data: userRole } = useUserRole();
  const isAccountOwner = userRole?.isOwner || false;

  if (!isAccountOwner) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Configuration</h3>
              <p className="text-gray-600 text-sm max-w-md">
                Email integrations are managed by your account owner. If you need access to configure email settings, please contact your account administrator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <EmailSetupStatusCard />
      <SendGridSetup />
      <SendGridWebhookDiagnostics />
    </div>
  );
};