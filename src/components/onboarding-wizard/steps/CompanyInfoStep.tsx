import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Mail, Phone, MapPin, User } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';

interface StepProps {
  data: OnboardingData;
  updateSection: (section: keyof OnboardingData, data: any) => void;
  isSaving: boolean;
}

export const CompanyInfoStep = ({ data, updateSection }: StepProps) => {
  const companyInfo = data.company_info || {};

  const handleChange = (field: string, value: string) => {
    updateSection('company_info', { ...companyInfo, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Company Information
        </CardTitle>
        <CardDescription>
          Enter your business details. These will appear on quotes and invoices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company_name"
              placeholder="Acme Blinds & Curtains"
              value={companyInfo.company_name || ''}
              onChange={(e) => handleChange('company_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="abn">ABN / Tax ID</Label>
            <Input
              id="abn"
              placeholder="12 345 678 901"
              value={companyInfo.abn || ''}
              onChange={(e) => handleChange('abn', e.target.value)}
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Business Address
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                placeholder="123 Main Street"
                value={companyInfo.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Sydney"
                  value={companyInfo.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="NSW"
                  value={companyInfo.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">Postal Code</Label>
                <Input
                  id="zip_code"
                  placeholder="2000"
                  value={companyInfo.zip_code || ''}
                  onChange={(e) => handleChange('zip_code', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Australia"
                  value={companyInfo.country || ''}
                  onChange={(e) => handleChange('country', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Person */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            Primary Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Name</Label>
              <Input
                id="contact_person"
                placeholder="John Smith"
                value={companyInfo.contact_person || ''}
                onChange={(e) => handleChange('contact_person', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  placeholder="john@acmeblinds.com"
                  value={companyInfo.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  className="pl-10"
                  placeholder="+61 2 1234 5678"
                  value={companyInfo.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
