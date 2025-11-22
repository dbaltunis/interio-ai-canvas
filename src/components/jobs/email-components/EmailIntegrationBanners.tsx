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

  // For team members, show a simple ready-to-use banner
  if (!isAccountOwner) {
    if (hasEmailSettings) {
      return (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Email Service Ready</p>
                <p className="text-sm text-green-700">Your company email is configured with 500 emails/month included. Advanced tracking (opens, clicks, engagement) is active.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      return (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Email Settings Needed</p>
                <p className="text-sm text-amber-700">Your account owner needs to configure sender email settings. Email service is ready - just needs personalization.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  // Account owners see the setup banners
  return (
    <>
      {/* Email Settings Banner - Only thing that's required */}
      {!hasEmailSettings ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Configure Email Settings</p>
                  <p className="text-sm text-yellow-700">Set up your sender name and email to start sending. Email service is already active (500/month included).</p>
                </div>
              </div>
              <Button onClick={onEmailSettingsClick} className="bg-yellow-600 hover:bg-yellow-700">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800">Email Service Ready</p>
                <p className="text-sm text-green-700">
                  You can send up to 500 emails per month with advanced tracking (opens, clicks, time spent). 
                  {hasSendGridIntegration 
                    ? " Using your custom SendGrid account for unlimited sending."
                    : " Want unlimited? Upgrade to custom SendGrid in Settings."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};