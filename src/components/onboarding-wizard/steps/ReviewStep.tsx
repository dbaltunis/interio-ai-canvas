import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, AlertCircle, Rocket, Download } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';
interface ReviewStepProps {
  data: OnboardingData;
  completionStatus: Record<string, boolean>;
  onComplete: () => void;
}
const SECTION_LABELS: Record<string, {
  label: string;
  icon: string;
  required: boolean;
}> = {
  company_info: {
    label: 'Company Information',
    icon: '🏢',
    required: true
  },
  regional_settings: {
    label: 'Regional Settings',
    icon: '🌍',
    required: true
  },
  document_sequences: {
    label: 'Document Sequences',
    icon: '📄',
    required: false
  },
  inventory_data: {
    label: 'Product Inventory',
    icon: '📦',
    required: false
  },
  pricing_grids: {
    label: 'Pricing Grids',
    icon: '📊',
    required: false
  },
  window_coverings: {
    label: 'Window Covering Types',
    icon: '🪟',
    required: true
  },
  manufacturing_settings: {
    label: 'Manufacturing Settings',
    icon: '🏭',
    required: false
  },
  stock_management: {
    label: 'Stock Management',
    icon: '📋',
    required: false
  },
  email_templates: {
    label: 'Email Templates',
    icon: '✉️',
    required: false
  },
  quotation_settings: {
    label: 'Quotation Settings',
    icon: '💰',
    required: false
  },
  integrations_config: {
    label: 'Integrations',
    icon: '🔌',
    required: false
  },
  users_permissions: {
    label: 'Team Members',
    icon: '👥',
    required: false
  }
};
export const ReviewStep = ({
  data,
  completionStatus,
  onComplete
}: ReviewStepProps) => {
  const completedCount = Object.values(completionStatus).filter(Boolean).length;
  const totalSections = Object.keys(SECTION_LABELS).length;
  const requiredSections = Object.entries(SECTION_LABELS).filter(([_, config]) => config.required).map(([key]) => key);
  const allRequiredComplete = requiredSections.every(key => completionStatus[key]);
  return <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Review & Complete Setup
          </CardTitle>
          
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-2xl font-bold">{completedCount}/{totalSections}</div>
              <div className="text-sm text-muted-foreground">Sections completed</div>
            </div>
            <div className="text-right">
              {allRequiredComplete ? <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Ready to complete</span>
                </div> : <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Complete required sections</span>
                </div>}
            </div>
          </div>

          {/* Section Status List */}
          <div className="space-y-2">
            {Object.entries(SECTION_LABELS).map(([key, config]) => {
            const isComplete = completionStatus[key];
            return <div key={key} className={`flex items-center justify-between p-3 border rounded-lg ${isComplete ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' : ''}`}>
                  <div className="flex items-center gap-3">
                    
                    <div>
                      <div className="font-medium text-sm">{config.label}</div>
                      {config.required && <div className="text-xs text-muted-foreground">Required</div>}
                    </div>
                  </div>
                  {isComplete ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                </div>;
          })}
          </div>

          {/* Data Preview */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Configuration Summary</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {data.company_info?.company_name && <div>
                  <span className="text-muted-foreground">Company:</span>{' '}
                  <span className="font-medium">{data.company_info.company_name}</span>
                </div>}
              {data.regional_settings?.currency && <div>
                  <span className="text-muted-foreground">Currency:</span>{' '}
                  <span className="font-medium">{data.regional_settings.currency}</span>
                </div>}
              {data.regional_settings?.measurement_units && <div>
                  <span className="text-muted-foreground">Units:</span>{' '}
                  <span className="font-medium capitalize">{data.regional_settings.measurement_units}</span>
                </div>}
              {data.window_coverings && <div>
                  <span className="text-muted-foreground">Products:</span>{' '}
                  <span className="font-medium">
                    {Object.entries(data.window_coverings).filter(([k, v]) => v === true && k !== 'pricing_methods').length} types enabled
                  </span>
                </div>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button size="lg" className="flex-1" onClick={onComplete} disabled={!allRequiredComplete}>
              <Rocket className="h-4 w-4 mr-2" />
              Apply Settings & Complete Setup
            </Button>
            
          </div>

          {!allRequiredComplete && <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-amber-800 dark:text-amber-200">Missing required sections:</strong>
                  <ul className="mt-1 text-amber-700 dark:text-amber-300">
                    {requiredSections.filter(key => !completionStatus[key]).map(key => <li key={key}>• {SECTION_LABELS[key].label}</li>)}
                  </ul>
                </div>
              </div>
            </div>}
        </CardContent>
      </Card>
    </div>;
};