import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Crown, 
  X, 
  ExternalLink,
  CreditCard 
} from 'lucide-react';

interface SubscriptionBannerProps {
  hasActiveSubscription: boolean;
  subscriptionEnd?: string;
  onDismiss?: () => void;
  variant?: 'warning' | 'expired' | 'trial';
}

export const SubscriptionBanner = ({ 
  hasActiveSubscription, 
  subscriptionEnd, 
  onDismiss,
  variant = 'expired'
}: SubscriptionBannerProps) => {
  const [isManaging, setIsManaging] = useState(false);
  const { toast } = useToast();

  const handleManageBilling = async () => {
    try {
      setIsManaging(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsManaging(false);
    }
  };

  if (hasActiveSubscription) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'expired':
        return 'border-red-200 bg-red-50';
      case 'trial':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-red-200 bg-red-50';
    }
  };

  const getVariantIcon = () => {
    switch (variant) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'trial':
        return <Crown className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getVariantText = () => {
    switch (variant) {
      case 'warning':
        return {
          title: 'Subscription Expiring Soon',
          description: 'Your subscription will expire soon. Renew now to avoid service interruption.',
          buttonText: 'Renew Subscription'
        };
      case 'trial':
        return {
          title: 'Trial Period Active',
          description: 'You\'re currently on a free trial. Subscribe to continue using all features.',
          buttonText: 'Subscribe Now'
        };
      default:
        return {
          title: 'Subscription Expired',
          description: 'Your subscription has expired. Reactivate to restore full access to all features.',
          buttonText: 'Reactivate Now'
        };
    }
  };

  const variantText = getVariantText();

  return (
    <Card className={`${getVariantStyles()} border-l-4 mb-6`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getVariantIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">{variantText.title}</h3>
                <Badge variant="outline" className="text-xs">
                  Limited Access
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {variantText.description}
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={handleManageBilling}
                  disabled={isManaging}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {isManaging ? 'Loading...' : variantText.buttonText}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('/settings', '_self')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Billing
                </Button>
              </div>
            </div>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};