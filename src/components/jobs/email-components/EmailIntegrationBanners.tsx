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

  // Team members - simple banner
  if (!isAccountOwner) {
    if (!hasEmailSettings) {
      return (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-800">
                <span className="font-medium">Setup Required:</span> Your account owner needs to configure email settings.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null; // Don't show banner for team members with configured email
  }

  // Account owners - setup prompt if not configured
  if (!hasEmailSettings) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Quick Setup Required</p>
                <p className="text-sm text-blue-700">Configure sender details to start sending emails (1 min)</p>
              </div>
            </div>
            <Button onClick={onEmailSettingsClick} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0">
              <Settings className="h-4 w-4 mr-2" />
              Set Up
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show banner if everything is configured
  return null;
};