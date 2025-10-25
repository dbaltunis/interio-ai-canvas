import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Step {
  title: string;
  description: string;
  action?: string;
  actionLabel?: string;
  completed?: boolean;
}

interface ShopifyGettingStartedGuideProps {
  integration: any;
  onNavigateToTab: (tab: string) => void;
}

export const ShopifyGettingStartedGuide = ({ 
  integration, 
  onNavigateToTab 
}: ShopifyGettingStartedGuideProps) => {
  const hasCredentials = integration?.shop_domain && integration?.access_token;
  const hasWebhooks = false; // We'll implement webhook verification later
  const hasSyncedProducts = false; // We'll implement this tracking later

  const steps: Step[] = [
    {
      title: "Create a Shopify Store",
      description: "You need a Shopify store to connect. If you don't have one yet, sign up at Shopify.com",
      action: "https://www.shopify.com/free-trial",
      actionLabel: "Sign up for Shopify",
      completed: hasCredentials,
    },
    {
      title: "Get Your Shopify Credentials",
      description: "You'll need your store domain (e.g., your-store.myshopify.com) and an Admin API access token from Shopify",
      action: "https://help.shopify.com/en/manual/apps/app-types/custom-apps",
      actionLabel: "Learn How to Get API Token",
      completed: hasCredentials,
    },
    {
      title: "Connect Your Store",
      description: "Enter your Shopify credentials in the Setup tab to establish the connection",
      actionLabel: "Go to Setup",
      completed: hasCredentials,
    },
    {
      title: "Configure Webhooks",
      description: "Set up webhooks in Shopify so orders automatically create jobs in InterioApp",
      actionLabel: "Go to Webhooks",
      completed: hasWebhooks,
    },
    {
      title: "Configure Sync Settings",
      description: "Choose what data to sync between InterioApp and Shopify (inventory, prices, images)",
      actionLabel: "Go to Sync Settings",
      completed: integration?.auto_sync_enabled,
    },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  const handleAction = (step: Step, index: number) => {
    if (step.action && step.action.startsWith('http')) {
      window.open(step.action, '_blank');
    } else {
      // Navigate to appropriate tab
      if (index === 2) onNavigateToTab('setup');
      if (index === 3) onNavigateToTab('webhooks');
      if (index === 4) onNavigateToTab('sync');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Getting Started with Shopify</CardTitle>
          <CardDescription>
            Follow these steps to connect your Shopify store and start syncing orders, customers, and products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Setup Progress</span>
              <span className="text-sm text-muted-foreground">{completedSteps} of {steps.length} completed</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card key={index} className={step.completed ? "border-green-200 bg-green-50/50" : ""}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {step.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono">
                              Step {index + 1}
                            </Badge>
                            {step.completed && (
                              <Badge variant="default" className="bg-green-600">
                                Complete
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold mb-1">{step.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      {!step.completed && step.actionLabel && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(step, index)}
                          className="mt-2"
                        >
                          {step.actionLabel}
                          {step.action?.startsWith('http') ? (
                            <ExternalLink className="h-3 w-3 ml-2" />
                          ) : (
                            <ArrowRight className="h-3 w-3 ml-2" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription className="space-y-2">
          <p className="font-semibold">What happens after setup?</p>
          <ul className="space-y-1 text-sm list-disc list-inside">
            <li><strong>Orders from Shopify</strong> → Automatically create work orders in your Jobs section</li>
            <li><strong>Customers from Shopify</strong> → Automatically added to your CRM</li>
            <li><strong>Products from InterioApp</strong> → Push to your Shopify store with one click</li>
            <li><strong>Real-time updates</strong> → Order status changes sync automatically via webhooks</li>
          </ul>
        </AlertDescription>
      </Alert>

      {completedSteps === steps.length && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Setup Complete!</h3>
                <p className="text-sm text-green-700">
                  Your Shopify store is connected and ready. Orders will now automatically sync to InterioApp.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
