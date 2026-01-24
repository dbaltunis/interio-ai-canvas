import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2 } from "lucide-react";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { useEmailDeliverability, analyzeEmailContent, calculateDeliverabilityScore } from "@/hooks/useEmailDeliverability";
import { DeliverabilityScoreCard } from "@/components/campaigns/DeliverabilityScoreCard";

export const EmailSetupStatusCard = () => {
  const { hasSendGridIntegration } = useIntegrationStatus();
  const { data: deliverabilityData, isLoading } = useEmailDeliverability();

  // Calculate score with empty content (just domain/reputation factors)
  const contentAnalysis = analyzeEmailContent('', '');
  const deliverabilityScore = calculateDeliverabilityScore(deliverabilityData, contentAnalysis, []);

  // Override usingSharedService when custom SendGrid is connected
  const effectiveUsingSharedService = hasSendGridIntegration ? false : deliverabilityScore.usingSharedService;

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
            <p className="text-green-800 mb-3">
              {hasSendGridIntegration 
                ? "Using your custom SendGrid account for email delivery"
                : "Email service is active via InterioApp (500 emails/month included)"
              }
            </p>
            
            {/* Deliverability Score */}
            {isLoading ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            ) : (
              <div className="mt-4">
                <DeliverabilityScoreCard
                  percentage={deliverabilityScore.percentage}
                  breakdown={deliverabilityScore.breakdown}
                  recommendations={hasSendGridIntegration ? deliverabilityScore.recommendations.filter(r => !r.toLowerCase().includes('shared') && !r.toLowerCase().includes('sendgrid')) : deliverabilityScore.recommendations}
                  showDetails={true}
                  usingSharedService={effectiveUsingSharedService}
                  serviceInfo={hasSendGridIntegration ? { provider: 'SendGrid', domain: 'custom', status: 'fully_authenticated' } : deliverabilityScore.serviceInfo}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
