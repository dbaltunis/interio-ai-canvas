import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: any;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center" style={{ flex: 1 }}>
              {/* Circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-background",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isActive && "border-primary scale-110 shadow-lg shadow-primary/20",
                  !isActive && !isCompleted && "border-muted-foreground/30"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive && "text-primary"
                  )} />
                )}
              </div>

              {/* Label */}
              <div className="text-center mt-3 max-w-[120px]">
                <p className={cn(
                  "text-sm font-medium transition-colors",
                  isActive && "text-primary",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
