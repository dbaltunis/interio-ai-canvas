import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Settings, CheckCircle, Mail } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

interface EmailIntegrationBannersProps {
  hasSendGridIntegration: boolean;
  hasEmailSettings: boolean;
  onEmailSettingsClick: () => void;
}

export const EmailIntegrationBanners = ({ 
  hasSendGridIntegration, 
  hasEmailSettings, 
  onEmailSettingsClick 
}: EmailIntegrationBannersProps) => {
  const { data: userRole } = useUserRole();
  const isAccountOwner = userRole?.isOwner || false;

  // For team members, show a simple ready-to-use banner when email is configured
  if (!isAccountOwner) {
    if (hasSendGridIntegration && hasEmailSettings) {
      return (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Company Email Ready</p>
                <p className="text-sm text-green-700">Your company email is configured and ready to use. You can send emails to clients and prospects.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      return (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Email Setup in Progress</p>
                <p className="text-sm text-blue-700">Your account owner is setting up company email. You'll be able to send emails once it's ready.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  // Account owners see the full setup banners
  return (
    <>
      {/* SendGrid Integration Status */}
      {!hasSendGridIntegration && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">SendGrid Integration Required</p>
                  <p className="text-sm text-orange-700">Set up SendGrid integration for email delivery tracking and analytics to work properly.</p>
                </div>
              </div>
              <Button 
                onClick={() => window.open('/settings', '_blank')} 
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Setup Integration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Settings Banner */}
      {!hasEmailSettings && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Email Settings Required</p>
                  <p className="text-sm text-yellow-700">Configure your sender email address to start sending emails.</p>
                </div>
              </div>
              <Button onClick={onEmailSettingsClick} className="bg-yellow-600 hover:bg-yellow-700">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};