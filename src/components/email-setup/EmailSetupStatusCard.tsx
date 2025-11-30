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
  const { hasSendGridIntegration } = useIntegrationStatus();

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              ✅ Email Service Ready
              <Badge variant="default" className="bg-green-600 text-white">Active</Badge>
            </h3>
            <p className="text-green-800 mb-2">
              {hasSendGridIntegration 
                ? "Using your custom SendGrid account for email delivery"
                : "Email service is active (500 emails/month included)"
              }
            </p>
            <div className="text-sm text-green-700">
              You can now send quotes and notifications to your customers with full tracking
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};