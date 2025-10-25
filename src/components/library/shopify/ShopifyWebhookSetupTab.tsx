import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface ShopifyWebhookSetupTabProps {
  integration: any;
}

export const ShopifyWebhookSetupTab = ({ integration }: ShopifyWebhookSetupTabProps) => {
  const { toast } = useToast();
  const webhookUrl = `${window.location.origin}/api/webhooks/shopify`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Webhook URL has been copied",
    });
  };

  const webhooks = [
    {
      topic: 'orders/create',
      description: 'Triggered when a new order is placed',
      action: 'Creates a new work order with status "Online Store Lead"',
    },
    {
      topic: 'orders/updated',
      description: 'Triggered when an order is updated',
      action: 'Updates the work order status (e.g., to "Online Store Sale" when paid)',
    },
    {
      topic: 'customers/create',
      description: 'Triggered when a new customer registers',
      action: 'Creates a new lead in your CRM',
    },
    {
      topic: 'customers/update',
      description: 'Triggered when customer details are updated',
      action: 'Updates the client information in CRM',
    },
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          Set up webhooks in your Shopify admin to enable real-time synchronization of orders and customers.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Webhook URL</CardTitle>
          <CardDescription>
            Use this URL for all webhook subscriptions in your Shopify admin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={webhookUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(webhookUrl)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(`https://${integration?.shop_domain}/admin/settings/notifications`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Shopify Webhook Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Required Webhooks</CardTitle>
          <CardDescription>
            Set up these webhooks in Shopify to enable full integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webhooks.map((webhook, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {webhook.topic}
                    </Badge>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{webhook.description}</p>
                <div className="flex items-start gap-2 text-xs bg-muted/30 p-2 rounded">
                  <span className="font-medium">Action:</span>
                  <span className="text-muted-foreground">{webhook.action}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">1</Badge>
              <span>Go to your Shopify admin → Settings → Notifications</span>
            </li>
            <li className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">2</Badge>
              <span>Scroll to "Webhooks" section and click "Create webhook"</span>
            </li>
            <li className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">3</Badge>
              <span>Select the event (e.g., "Order creation")</span>
            </li>
            <li className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">4</Badge>
              <span>Paste the webhook URL from above</span>
            </li>
            <li className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">5</Badge>
              <span>Set webhook format to "JSON"</span>
            </li>
            <li className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">6</Badge>
              <span>Click "Save webhook" and repeat for all required webhook topics</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
