import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: readonly string[];
  completionStatus: Record<string, boolean>;
  onStepClick: (step: number) => void;
}

const STEP_LABELS: Record<string, string> = {
  company_info: 'Company Info',
  regional_settings: 'Regional',
  document_sequences: 'Documents',
  inventory_data: 'Inventory',
  pricing_grids: 'Pricing',
  window_coverings: 'Products',
  manufacturing_settings: 'Manufacturing',
  stock_management: 'Stock',
  email_templates: 'Email',
  quotation_settings: 'Quotes',
  integrations_config: 'Integrations',
  users_permissions: 'Users',
  review: 'Review',
};

export const WizardProgress = ({
  currentStep,
  totalSteps,
  steps,
  completionStatus,
  onStepClick,
}: WizardProgressProps) => {
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>

      {/* Step indicators - scrollable on mobile */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex items-center gap-1 min-w-max">
          {steps.map((step, index) => {
            const isComplete = completionStatus[step] || index < currentStep;
            const isCurrent = index === currentStep;
            const label = STEP_LABELS[step] || step;

            return (
              <button
                key={step}
                onClick={() => onStepClick(index)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all",
                  isCurrent && "bg-primary text-primary-foreground",
                  !isCurrent && isComplete && "bg-primary/10 text-primary hover:bg-primary/20",
                  !isCurrent && !isComplete && "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {isComplete && !isCurrent ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
