import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, Calendar, FileCheck } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';

interface StepProps {
  data: OnboardingData;
  updateSection: (section: keyof OnboardingData, data: any) => void;
  isSaving: boolean;
}

const DEFAULT_TERMS = `1. This quote is valid for 30 days from the date of issue.
2. A 50% deposit is required upon acceptance of this quote.
3. Final payment is due upon completion of installation.
4. All prices include GST unless otherwise stated.
5. Lead times are estimates only and may vary.
6. Changes to the order may incur additional charges.
7. Warranty terms apply as per manufacturer specifications.`;

export const QuotationSettingsStep = ({ data, updateSection }: StepProps) => {
  const settings = data.quotation_settings || {};

  const handleChange = (field: string, value: any) => {
    updateSection('quotation_settings', { ...settings, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Quotation Settings
        </CardTitle>
        <CardDescription>
          Configure default settings for your quotes and proposals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quote Validity */}
        <div className="space-y-2">
          <Label htmlFor="validity_days" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Quote Validity Period
          </Label>
          <div className="flex items-center gap-2 max-w-xs">
            <Input
              id="validity_days"
              type="number"
              min="1"
              max="365"
              value={settings.validity_days || 30}
              onChange={(e) => handleChange('validity_days', parseInt(e.target.value) || 30)}
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">days</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Quotes will show an expiry date based on this period
          </p>
        </div>

        {/* Quote Style */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-muted-foreground" />
            Quote Display Style
          </Label>
          <RadioGroup
            value={settings.quote_style || 'detailed'}
            onValueChange={(value) => handleChange('quote_style', value)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="flex items-start space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="detailed" id="detailed" />
              <Label htmlFor="detailed" className="cursor-pointer flex-1">
                <div className="font-medium">Detailed</div>
                <div className="text-sm text-muted-foreground">
                  Show full breakdown with measurements, options, and individual line items
                </div>
              </Label>
            </div>
            <div className="flex items-start space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="summary" id="summary" />
              <Label htmlFor="summary" className="cursor-pointer flex-1">
                <div className="font-medium">Summary</div>
                <div className="text-sm text-muted-foreground">
                  Show summarized totals per room or window covering type
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-2">
          <Label htmlFor="terms">Terms & Conditions</Label>
          <Textarea
            id="terms"
            rows={8}
            placeholder="Enter your standard terms and conditions..."
            value={settings.terms_conditions || DEFAULT_TERMS}
            onChange={(e) => handleChange('terms_conditions', e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            These terms will appear on all quotes and invoices
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <strong>Note:</strong> Individual quotes can have custom terms that override these defaults.
        </div>
      </CardContent>
    </Card>
  );
};
