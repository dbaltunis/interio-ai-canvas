
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Settings } from "lucide-react";

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
