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
    <div className="space-y-6">
      {/* Email Included Banner */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-2">✅ Email Service Included!</h3>
              <p className="text-green-800 mb-3">
                Your account includes email functionality with up to <strong>500 emails per month</strong> using our shared email service. Advanced tracking (opens, clicks, engagement analytics) is built-in!
              </p>
              <div className="text-sm text-green-700">
                <strong>Current Status:</strong> Email service is active and ready to use with full analytics
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Premium Feature Card */}
      <Card className="border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">💎 Premium: Custom Email Domain</h3>
              <p className="text-gray-600 mb-3">
                Want to use your own SendGrid account for custom branding and unlimited sending? Set it up below. (Note: Tracking and analytics work the same with both Resend and SendGrid)
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>Custom "from" email addresses (@yourbusiness.com)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>Unlimited sending (based on your SendGrid plan)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>Advanced deliverability controls</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>Dedicated IP address options</span>
                </div>
              </div>
            </div>
          </div>
          
          <SendGridSetup />
        </CardContent>
      </Card>

      <SendGridWebhookDiagnostics />
    </div>
  );
};