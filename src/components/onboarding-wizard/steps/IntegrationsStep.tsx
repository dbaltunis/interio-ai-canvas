import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  { id: 'twc', name: 'TWC (Total Window Coverings)' },
  { id: 'louvolite', name: 'Louvolite' },
  { id: 'rollease', name: 'Rollease Acmeda' },
  { id: 'somfy', name: 'Somfy' },
  { id: 'other', name: 'Other' },
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
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <Label className="font-medium">SendGrid Email</Label>
            </div>
            <Switch
              checked={settings.sendgrid_enabled || false}
              onCheckedChange={(checked) => handleChange('sendgrid_enabled', checked)}
            />
          </div>
          
          {settings.sendgrid_enabled && (
            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="sendgrid_key">API Key</Label>
              <Input
                id="sendgrid_key"
                type="password"
                placeholder="SG.xxxxxxxxxxxxxx"
                value={settings.sendgrid_api_key || ''}
                onChange={(e) => handleChange('sendgrid_api_key', e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <Label className="font-medium">ERP / Accounting</Label>
            </div>
            <Switch
              checked={settings.erp_enabled || false}
              onCheckedChange={(checked) => handleChange('erp_enabled', checked)}
            />
          </div>
          
          {settings.erp_enabled && (
            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="erp_details">Details</Label>
              <Textarea
                id="erp_details"
                placeholder="ERP system and integration requirements..."
                rows={3}
                value={settings.erp_details || ''}
                onChange={(e) => handleChange('erp_details', e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <Label className="font-medium">Suppliers</Label>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SUPPLIERS.map((supplier) => (
              <div
                key={supplier.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <Checkbox
                  id={supplier.id}
                  checked={(settings.suppliers || []).includes(supplier.id)}
                  onCheckedChange={() => toggleSupplier(supplier.id)}
                />
                <Label htmlFor={supplier.id} className="cursor-pointer text-sm">
                  {supplier.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
