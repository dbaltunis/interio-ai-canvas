import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Ruler, DollarSign, Calendar, Clock } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';

interface StepProps {
  data: OnboardingData;
  updateSection: (section: keyof OnboardingData, data: any) => void;
  isSaving: boolean;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2024)' },
];

const TIMEZONES = [
  { value: 'Pacific/Auckland', label: 'Auckland (GMT+13)' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+11)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (GMT+11)' },
  { value: 'Australia/Brisbane', label: 'Brisbane (GMT+10)' },
  { value: 'Australia/Perth', label: 'Perth (GMT+8)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
];

export const RegionalSettingsStep = ({ data, updateSection }: StepProps) => {
  const settings = data.regional_settings || {};

  const handleChange = (field: string, value: string) => {
    updateSection('regional_settings', { ...settings, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Regional Settings
        </CardTitle>
        <CardDescription>
          Configure measurement units, currency, and date formats for your region.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Measurement Units */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-medium">Measurement Units</Label>
          </div>
          <RadioGroup
            value={settings.measurement_units || 'metric'}
            onValueChange={(value) => handleChange('measurement_units', value)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="metric" id="metric" />
              <Label htmlFor="metric" className="cursor-pointer flex-1">
                <div className="font-medium">Metric</div>
                <div className="text-sm text-muted-foreground">Millimeters, centimeters, meters</div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="imperial" id="imperial" />
              <Label htmlFor="imperial" className="cursor-pointer flex-1">
                <div className="font-medium">Imperial</div>
                <div className="text-sm text-muted-foreground">Inches, feet, yards</div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Currency */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-medium">Currency</Label>
          </div>
          <Select
            value={settings.currency || 'USD'}
            onValueChange={(value) => handleChange('currency', value)}
          >
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <span className="flex items-center gap-2">
                    <span className="font-mono">{currency.symbol}</span>
                    <span>{currency.name} ({currency.code})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Format */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-medium">Date Format</Label>
          </div>
          <Select
            value={settings.date_format || 'DD/MM/YYYY'}
            onValueChange={(value) => handleChange('date_format', value)}
          >
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Select date format" />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timezone */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-medium">Timezone</Label>
          </div>
          <Select
            value={settings.timezone || 'Australia/Sydney'}
            onValueChange={(value) => handleChange('timezone', value)}
          >
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
