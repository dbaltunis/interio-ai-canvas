import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useMeasurementWizardStore } from '@/stores/measurementWizardStore';

// Import step components
import { TemplateStep } from './steps/TemplateStep';
import { HardwareStep } from './steps/HardwareStep';
import { PanelsStep } from './steps/PanelsStep';
import { MeasureStep } from './steps/MeasureStep';
import { FabricStep } from './steps/FabricStep';
import { HeadingStep } from './steps/HeadingStep';
import { ExtrasStep } from './steps/ExtrasStep';
import { SummaryStep } from './steps/SummaryStep';

interface MeasurementWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId?: string;
  windowId?: string;
  onComplete?: () => void;
}

const steps = [
  { id: 1, title: 'Template', description: 'Choose product template and window type' },
  { id: 2, title: 'Hardware', description: 'Select tracks, poles and brackets' },
  { id: 3, title: 'Panels', description: 'Configure panel setup' },
  { id: 4, title: 'Measure', description: 'Enter measurements' },
  { id: 5, title: 'Fabric & Lining', description: 'Choose fabrics and linings' },
  { id: 6, title: 'Heading & Finish', description: 'Select heading type and finish' },
  { id: 7, title: 'Extras & Notes', description: 'Add optional extras and notes' },
  { id: 8, title: 'Price & Summary', description: 'Review pricing and save' }
];

export const MeasurementWizard: React.FC<MeasurementWizardProps> = ({
  open,
  onOpenChange,
  jobId,
  windowId,
  onComplete
}) => {
  const {
    currentStep,
    mode,
    error,
    nextStep,
    prevStep,
    toggleMode,
    loadFromJob,
    reset,
    setJobId
  } = useMeasurementWizardStore();

  useEffect(() => {
    if (open) {
      if (jobId && windowId) {
        // Load existing window data
        loadFromJob(jobId, windowId);
      } else if (jobId) {
        // Set job ID for new window
        setJobId(jobId);
        reset();
      } else {
        // Reset for demo mode
        reset();
      }
    }
  }, [open, jobId, windowId, loadFromJob, reset, setJobId]);

  const currentStepData = steps.find(step => step.id === currentStep);
  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    nextStep();
  };

  const handlePrev = () => {
    prevStep();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <TemplateStep />;
      case 2:
        return <HardwareStep />;
      case 3:
        return <PanelsStep />;
      case 4:
        return <MeasureStep />;
      case 5:
        return <FabricStep />;
      case 6:
        return <HeadingStep />;
      case 7:
        return <ExtrasStep />;
      case 8:
        return <SummaryStep onComplete={onComplete || (() => onOpenChange(false))} />;
      default:
        return <TemplateStep />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-2xl font-bold">
                Measurement Wizard
              </DialogTitle>
              <Badge variant={mode === 'quick' ? 'default' : 'secondary'}>
                {mode.toUpperCase()} Mode
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMode}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Switch to {mode === 'quick' ? 'Pro' : 'Quick'}
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {steps.length}: {currentStepData?.title}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {currentStepData?.description}
            </p>
          </div>
          
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          {renderStepContent()}
        </div>

        <div className="border-t pt-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {steps.map((step) => (
              <Button
                key={step.id}
                variant={step.id === currentStep ? 'default' : step.id < currentStep ? 'secondary' : 'outline'}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => useMeasurementWizardStore.getState().setCurrentStep(step.id)}
              >
                {step.id}
              </Button>
            ))}
          </div>
          
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};