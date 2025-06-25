
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ShoppingBag, Mail, MessageSquare, Cloud, Key, Settings } from "lucide-react";

export const IntegrationsTab = () => {
  const integrations = [
    {
      name: "Shopify Store",
      icon: ShoppingBag,
      description: "Sync products, inventory, and orders with your Shopify store",
      status: "Not Connected",
      features: ["Product Sync", "Inventory Management", "Order Import", "Customer Sync"]
    },
    {
      name: "Email Marketing",
      icon: Mail,
      description: "Send automated quotes and follow-ups via email",
      status: "Configured",
      features: ["Quote Emails", "Order Confirmations", "Follow-ups", "Newsletters"]
    },
    {
      name: "SMS Notifications",
      icon: MessageSquare,
      description: "Send appointment reminders and updates via SMS",
      status: "Not Connected",
      features: ["Appointment Reminders", "Order Updates", "Delivery Notifications"]
    },
    {
      name: "Cloud Storage",
      icon: Cloud,
      description: "Backup and sync files with cloud storage providers",
      status: "Connected",
      features: ["File Backup", "Document Sync", "Photo Storage", "Auto Backup"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">External Integrations</h3>
          <p className="text-sm text-brand-neutral">Connect with external services and platforms</p>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid gap-6">
        {integrations.map((integration) => {
          const IconComponent = integration.icon;
          const isConnected = integration.status === "Connected" || integration.status === "Configured";
          
          return (
            <Card key={integration.name} className="border-brand-secondary/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-brand-secondary/10">
                      <IconComponent className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={isConnected ? "default" : "secondary"}
                      className={isConnected ? "bg-green-100 text-green-800" : ""}
                    >
                      {integration.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {integration.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                {integration.name === "Shopify Store" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shopifyStore">Store URL</Label>
                        <Input id="shopifyStore" placeholder="your-store.myshopify.com" />
                      </div>
                      <div>
                        <Label htmlFor="shopifyKey">API Key</Label>
                        <Input id="shopifyKey" type="password" placeholder="Enter API key..." />
                      </div>
                    </div>
                    <Button className="bg-brand-primary hover:bg-brand-accent">
                      Connect Shopify Store
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Shopify Integration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-primary" />
            Shopify Integration Settings
          </CardTitle>
          <CardDescription>Configure how your InterioApp syncs with Shopify</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Two-way inventory sync</h4>
                <p className="text-sm text-brand-neutral">Keep inventory levels synchronized between systems</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-import new orders</h4>
                <p className="text-sm text-brand-neutral">Automatically create projects from Shopify orders</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Sync customer data</h4>
                <p className="text-sm text-brand-neutral">Import customer information from Shopify</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Update order status</h4>
                <p className="text-sm text-brand-neutral">Update Shopify when orders are completed</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="syncFrequency">Sync Frequency</Label>
              <select id="syncFrequency" className="w-full p-2 border rounded-md">
                <option value="realtime">Real-time</option>
                <option value="hourly">Every hour</option>
                <option value="daily">Daily</option>
                <option value="manual">Manual only</option>
              </select>
            </div>
            <div>
              <Label htmlFor="pricePrefix">Price Prefix</Label>
              <Input id="pricePrefix" placeholder="e.g., INTERIO-" />
              <span className="text-xs text-brand-neutral">Prefix for InterioApp products in Shopify</span>
            </div>
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">Save Integration Settings</Button>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-brand-primary" />
            API Configuration
          </CardTitle>
          <CardDescription>Manage API keys and webhooks for external services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input id="webhookUrl" placeholder="https://your-domain.com/webhooks/shopify" />
            <span className="text-xs text-brand-neutral">URL for receiving webhook notifications</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emailProvider">Email Provider</Label>
              <select id="emailProvider" className="w-full p-2 border rounded-md">
                <option value="">Select provider...</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
                <option value="ses">Amazon SES</option>
              </select>
            </div>
            <div>
              <Label htmlFor="smsProvider">SMS Provider</Label>
              <select id="smsProvider" className="w-full p-2 border rounded-md">
                <option value="">Select provider...</option>
                <option value="twilio">Twilio</option>
                <option value="messagebird">MessageBird</option>
                <option value="clicksend">ClickSend</option>
              </select>
            </div>
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">Save API Configuration</Button>
        </CardContent>
      </Card>
    </div>
  );
};
