
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  ShoppingBag, 
  Database, 
  Calendar, 
  Truck,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const IntegrationManager = () => {
  const [connections, setConnections] = useState({
    sendgrid: { connected: false, status: 'disconnected' },
    shopify: { connected: false, status: 'disconnected' },
    erp: { connected: false, status: 'disconnected' },
    calendar: { connected: false, status: 'disconnected' },
    inventory: { connected: false, status: 'disconnected' },
  });

  const { toast } = useToast();

  const integrations = [
    {
      id: 'sendgrid',
      name: 'SendGrid Email',
      icon: Mail,
      description: 'Email delivery, tracking, and analytics',
      category: 'Communication',
      features: ['Email Delivery', 'Open Tracking', 'Click Analytics', 'Templates'],
      setupFields: [
        { name: 'api_key', label: 'API Key', type: 'password', required: true },
        { name: 'from_email', label: 'From Email', type: 'email', required: true },
        { name: 'from_name', label: 'From Name', type: 'text', required: true },
      ]
    },
    {
      id: 'shopify',
      name: 'Shopify Store',
      icon: ShoppingBag,
      description: 'Sync products, inventory, and orders',
      category: 'E-commerce',
      features: ['Product Sync', 'Inventory Management', 'Order Import', 'Customer Data'],
      setupFields: [
        { name: 'store_url', label: 'Store URL', type: 'url', required: true },
        { name: 'access_token', label: 'Access Token', type: 'password', required: true },
        { name: 'sync_frequency', label: 'Sync Frequency', type: 'select', options: ['realtime', 'hourly', 'daily'], required: true },
      ]
    },
    {
      id: 'erp',
      name: 'ERP System',
      icon: Database,
      description: 'Connect with your existing ERP system',
      category: 'Business Management',
      features: ['Product Data', 'Vendor Management', 'Financial Sync', 'Reporting'],
      setupFields: [
        { name: 'system_type', label: 'ERP System', type: 'select', options: ['SAP', 'Oracle', 'NetSuite', 'Custom'], required: true },
        { name: 'api_endpoint', label: 'API Endpoint', type: 'url', required: true },
        { name: 'username', label: 'Username', type: 'text', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
      ]
    },
    {
      id: 'calendar',
      name: 'Calendar Integration',
      icon: Calendar,
      description: 'Sync appointments with Google/Apple Calendar',
      category: 'Scheduling',
      features: ['Appointment Sync', 'Availability Check', 'Automated Reminders', 'Team Coordination'],
      setupFields: [
        { name: 'provider', label: 'Calendar Provider', type: 'select', options: ['google', 'apple', 'outlook'], required: true },
        { name: 'calendar_id', label: 'Calendar ID', type: 'text', required: true },
      ]
    },
    {
      id: 'inventory',
      name: 'Inventory Suppliers',
      icon: Truck,
      description: 'Connect with fabric and hardware suppliers',
      category: 'Supply Chain',
      features: ['Real-time Pricing', 'Availability Status', 'Automated Ordering', 'Lead Times'],
      setupFields: [
        { name: 'supplier_name', label: 'Supplier Name', type: 'text', required: true },
        { name: 'api_key', label: 'API Key', type: 'password', required: true },
        { name: 'catalog_endpoint', label: 'Catalog Endpoint', type: 'url', required: true },
      ]
    },
  ];

  const handleConnect = async (integrationId: string, formData: any) => {
    try {
      setConnections(prev => ({
        ...prev,
        [integrationId]: { connected: false, status: 'connecting' }
      }));

      // Simulate API call - replace with actual integration logic
      await new Promise(resolve => setTimeout(resolve, 2000));

      setConnections(prev => ({
        ...prev,
        [integrationId]: { connected: true, status: 'connected' }
      }));

      toast({
        title: "Integration Connected",
        description: `Successfully connected to ${integrations.find(i => i.id === integrationId)?.name}`,
      });
    } catch (error) {
      setConnections(prev => ({
        ...prev,
        [integrationId]: { connected: false, status: 'error' }
      }));

      toast({
        title: "Connection Failed",
        description: "Failed to connect to the integration. Please check your settings.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'connecting':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-blue-100 text-blue-800">Connecting...</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Not Connected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Manager</h2>
          <p className="text-gray-600">Connect with external services and tools</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="supply-chain">Supply Chain</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => {
              const IconComponent = integration.icon;
              const connection = connections[integration.id as keyof typeof connections];
              
              return (
                <Card key={integration.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {integration.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(connection.status)}
                        {getStatusBadge(connection.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {integration.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {integration.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className="w-full" 
                      variant={connection.connected ? "outline" : "default"}
                      disabled={connection.status === 'connecting'}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {connection.connected ? "Configure" : "Connect"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Individual category tabs would show filtered integrations with detailed setup forms */}
        <TabsContent value="communication">
          <IntegrationSetup 
            integrations={integrations.filter(i => i.category === 'Communication')}
            connections={connections}
            onConnect={handleConnect}
          />
        </TabsContent>

        <TabsContent value="ecommerce">
          <IntegrationSetup 
            integrations={integrations.filter(i => i.category === 'E-commerce')}
            connections={connections}
            onConnect={handleConnect}
          />
        </TabsContent>

        <TabsContent value="business">
          <IntegrationSetup 
            integrations={integrations.filter(i => i.category === 'Business Management')}
            connections={connections}
            onConnect={handleConnect}
          />
        </TabsContent>

        <TabsContent value="supply-chain">
          <IntegrationSetup 
            integrations={integrations.filter(i => i.category === 'Supply Chain')}
            connections={connections}
            onConnect={handleConnect}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface IntegrationSetupProps {
  integrations: any[];
  connections: any;
  onConnect: (id: string, data: any) => Promise<void>;
}

const IntegrationSetup = ({ integrations, connections, onConnect }: IntegrationSetupProps) => {
  const [formData, setFormData] = useState<{ [key: string]: any }>({});

  return (
    <div className="grid gap-6">
      {integrations.map((integration) => {
        const IconComponent = integration.icon;
        const connection = connections[integration.id];

        return (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <IconComponent className="h-6 w-6" />
                <div>
                  <CardTitle>{integration.name}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integration.setupFields.map((field: any) => (
                  <div key={field.name}>
                    <Label htmlFor={field.name}>{field.label}</Label>
                    {field.type === 'select' ? (
                      <select
                        id={field.name}
                        className="w-full p-2 border rounded-md"
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          [integration.id]: { 
                            ...prev[integration.id], 
                            [field.name]: e.target.value 
                          }
                        }))}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((option: string) => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={`Enter ${field.label}`}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          [integration.id]: { 
                            ...prev[integration.id], 
                            [field.name]: e.target.value 
                          }
                        }))}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={connection.connected}
                    disabled={connection.status === 'connecting'}
                  />
                  <span className="text-sm">Enable Integration</span>
                </div>
                <Button 
                  onClick={() => onConnect(integration.id, formData[integration.id])}
                  disabled={connection.status === 'connecting'}
                >
                  {connection.status === 'connecting' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : connection.connected ? (
                    'Update Connection'
                  ) : (
                    'Connect'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
