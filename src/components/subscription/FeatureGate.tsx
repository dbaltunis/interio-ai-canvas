import React from 'react';
import { useSubscriptionFeatures, FeatureKey } from '@/hooks/useSubscriptionFeatures';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}) => {
  const { hasFeature, isLoading } = useSubscriptionFeatures();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-32 rounded-lg" />;
  }

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <Alert className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <Lock className="h-5 w-5 text-primary" />
        <AlertDescription className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-foreground mb-1">
              Upgrade to access {feature.replace('_', ' ')}
            </p>
            <p className="text-sm text-muted-foreground">
              This feature is available on higher tier plans or as an add-on.
            </p>
          </div>
          <Button
            onClick={() => navigate('/settings/subscription')}
            className="shrink-0"
          >
            View Plans
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
