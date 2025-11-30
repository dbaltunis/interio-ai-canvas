import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Mail } from "lucide-react";
import { useEmailSettings } from "@/hooks/useEmailSettings";

export const EmailSettings = () => {
  const { data: emailSettings } = useEmailSettings();

  return (
    <div className="space-y-6">
      {/* Simple Status Card */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-green-900 mb-1">✅ Email Service Active</h3>
              <p className="text-sm text-green-700 mb-3">
                {emailSettings?.from_name && emailSettings?.from_email
                  ? `Sending as ${emailSettings.from_name} (${emailSettings.from_email})`
                  : 'Using default sender (noreply@interioapp.com)'}
              </p>
              <p className="text-xs text-green-700 mb-3">
                500 emails/month included • Advanced tracking enabled
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 bg-white hover:bg-gray-50"
                onClick={() => { 
                  const url = new URL(window.location.href);
                  url.pathname = '/';
                  url.search = 'tab=settings&subtab=email';
                  window.location.href = url.toString();
                }}
              >
                <Settings className="h-3 w-3" />
                Manage Email Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Note */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            💡 To customize sender information or upgrade to unlimited sending with SendGrid, visit <strong>Settings → Email</strong> and <strong>Settings → Integrations</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
