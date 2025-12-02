import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  isSaving: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const WizardNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  isSaving,
  isFirstStep,
  isLastStep,
}: WizardNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-4 px-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={isFirstStep}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </span>
          )}
        </div>

        <Button
          onClick={onNext}
          disabled={isLastStep}
          className="gap-2"
        >
          {isLastStep ? 'Review' : 'Next'}
          {!isLastStep && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
