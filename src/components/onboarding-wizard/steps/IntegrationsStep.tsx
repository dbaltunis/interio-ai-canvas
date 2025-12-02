import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Puzzle, Mail, Building2, Truck } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';

interface StepProps {
  data: OnboardingData;
  updateSection: (section: keyof OnboardingData, data: any) => void;
  isSaving: boolean;
}

const SUPPLIERS = [
  { id: 'twc', name: 'TWC (Total Window Coverings)', description: 'Australian blind manufacturer' },
  { id: 'louvolite', name: 'Louvolite', description: 'UK fabric and blind supplier' },
  { id: 'rollease', name: 'Rollease Acmeda', description: 'Motorization and hardware' },
  { id: 'somfy', name: 'Somfy', description: 'Smart home automation' },
  { id: 'other', name: 'Other', description: 'Custom supplier integration' },
];

export const IntegrationsStep = ({ data, updateSection }: StepProps) => {
  const settings = data.integrations_config || {};

  const handleChange = (field: string, value: any) => {
    updateSection('integrations_config', { ...settings, [field]: value });
  };

  const toggleSupplier = (supplierId: string) => {
    const currentSuppliers = settings.suppliers || [];
    const updated = currentSuppliers.includes(supplierId)
      ? currentSuppliers.filter((s: string) => s !== supplierId)
      : [...currentSuppliers, supplierId];
    handleChange('suppliers', updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Puzzle className="h-5 w-5 text-primary" />
          Integrations
        </CardTitle>
        <CardDescription>
          Connect external services and suppliers. All integrations are optional.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SendGrid Integration */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="font-medium">SendGrid Email</Label>
                <p className="text-sm text-muted-foreground">
                  Send emails from your own domain
                </p>
              </div>
            </div>
            <Switch
              checked={settings.sendgrid_enabled || false}
              onCheckedChange={(checked) => handleChange('sendgrid_enabled', checked)}
            />
          </div>
          
          {settings.sendgrid_enabled && (
            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="sendgrid_key">SendGrid API Key</Label>
              <Input
                id="sendgrid_key"
                type="password"
                placeholder="SG.xxxxxxxxxxxxxx"
                value={settings.sendgrid_api_key || ''}
                onChange={(e) => handleChange('sendgrid_api_key', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Find this in your SendGrid dashboard under Settings → API Keys
              </p>
            </div>
          )}
        </div>

        {/* ERP Integration */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="font-medium">ERP / Accounting System</Label>
                <p className="text-sm text-muted-foreground">
                  Connect to your existing business software
                </p>
              </div>
            </div>
            <Switch
              checked={settings.erp_enabled || false}
              onCheckedChange={(checked) => handleChange('erp_enabled', checked)}
            />
          </div>
          
          {settings.erp_enabled && (
            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="erp_details">Integration Details</Label>
              <Textarea
                id="erp_details"
                placeholder="Describe your ERP system and integration requirements..."
                rows={3}
                value={settings.erp_details || ''}
                onChange={(e) => handleChange('erp_details', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Our team will contact you to set up the integration
              </p>
            </div>
          )}
        </div>

        {/* Supplier Connections */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label className="font-medium">Supplier Integrations</Label>
              <p className="text-sm text-muted-foreground">
                Select suppliers you work with for order integration
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            {SUPPLIERS.map((supplier) => (
              <div
                key={supplier.id}
                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <Checkbox
                  id={supplier.id}
                  checked={(settings.suppliers || []).includes(supplier.id)}
                  onCheckedChange={() => toggleSupplier(supplier.id)}
                />
                <Label htmlFor={supplier.id} className="cursor-pointer flex-1">
                  <div className="font-medium text-sm">{supplier.name}</div>
                  <div className="text-xs text-muted-foreground">{supplier.description}</div>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <strong>Note:</strong> Integrations can be configured later in Settings → Integrations.
        </div>
      </CardContent>
    </Card>
  );
};
