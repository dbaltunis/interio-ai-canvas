import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle, Settings, Play, ExternalLink } from "lucide-react";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { useEmailSettings } from "@/hooks/useEmailSettings";
import { useState } from "react";
import { EmailSetupWizard } from "./EmailSetupWizard";

interface SetupItem {
  id: string;
  title: string;
  description: string;
  status: 'complete' | 'warning' | 'error' | 'pending';
  action?: () => void;
  actionLabel?: string;
  externalLink?: string;
}

export const EmailSetupStatusCard = () => {
  const [showWizard, setShowWizard] = useState(false);
  const { hasSendGridIntegration, integrationData } = useIntegrationStatus();
  const { data: emailSettings } = useEmailSettings();

  const getStatusIcon = (status: SetupItem['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: SetupItem['status']) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Complete</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Needs Attention</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Error</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const setupItems: SetupItem[] = [
    {
      id: 'sendgrid-account',
      title: 'SendGrid Account',
      description: 'Email service provider account for sending emails',
      status: 'complete', // Assume they have one if they're setting up
      externalLink: 'https://signup.sendgrid.com/'
    },
    {
      id: 'sendgrid-integration',
      title: 'SendGrid Integration',
      description: 'API key configured and connection established',
      status: hasSendGridIntegration ? 'complete' : 'error',
      action: () => window.open('/settings?tab=integrations', '_blank'),
      actionLabel: 'Configure Integration'
    },
    {
      id: 'sender-verification',
      title: 'Sender Email Verification',
      description: 'Verify your sender email address in SendGrid',
      status: emailSettings?.from_email ? 'complete' : 'pending',
      externalLink: 'https://app.sendgrid.com/settings/sender_auth'
    },
    {
      id: 'email-settings',
      title: 'Email Settings',
      description: 'Configure sender name, email, and signature',
      status: emailSettings ? 'complete' : 'error',
      action: () => window.open('/settings?tab=integrations', '_blank'),
      actionLabel: 'Configure Settings'
    },
    {
      id: 'webhook-setup',
      title: 'Webhook Configuration',
      description: 'Track email delivery and engagement events',
      status: integrationData ? 'complete' : 'warning',
      action: () => window.open('/settings?tab=integrations', '_blank'),
      actionLabel: 'Setup Webhooks'
    }
  ];

  const completedItems = setupItems.filter(item => item.status === 'complete').length;
  const totalItems = setupItems.length;
  const setupProgress = (completedItems / totalItems) * 100;

  const overallStatus = () => {
    if (completedItems === totalItems) return 'complete';
    if (setupItems.some(item => item.status === 'error')) return 'error';
    if (setupItems.some(item => item.status === 'warning')) return 'warning';
    return 'pending';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Email Setup Status
                {getStatusIcon(overallStatus())}
              </CardTitle>
              <CardDescription>
                {completedItems} of {totalItems} setup items completed ({Math.round(setupProgress)}%)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Setup Wizard
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Overview */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Setup Progress</span>
                <span>{Math.round(setupProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-brand-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${setupProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Setup Items */}
            <div className="space-y-3">
              {setupItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    {item.status !== 'complete' && (
                      <>
                        {item.action && (
                          <Button size="sm" variant="outline" onClick={item.action}>
                            {item.actionLabel}
                          </Button>
                        )}
                        {item.externalLink && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(item.externalLink, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {overallStatus() !== 'complete' && (
              <div className="pt-4 border-t">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowWizard(true)}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Setup Wizard
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('/settings?tab=integrations', '_blank')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manual Setup
                  </Button>
                </div>
              </div>
            )}

            {/* Success Message */}
            {overallStatus() === 'complete' && (
              <div className="pt-4 border-t">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Email functionality is fully configured!
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    You can now send emails to your customers with full delivery tracking.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EmailSetupWizard 
        open={showWizard}
        onOpenChange={setShowWizard}
        onComplete={() => {
          // Refresh the page or trigger a re-fetch to show updated status
          window.location.reload();
        }}
      />
    </>
  );
};