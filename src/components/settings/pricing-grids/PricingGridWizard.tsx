import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, CheckCircle2, Upload, Link as LinkIcon } from 'lucide-react';
import { StepIndicator } from './wizard/StepIndicator';
import { StepUploadGrid } from './wizard/StepUploadGrid';
import { StepConnectRule } from './wizard/StepConnectRule';
import { StepReview } from './wizard/StepReview';
import { ConceptDiagram } from './wizard/ConceptDiagram';

export interface WizardData {
  // Grid data
  gridName: string;
  gridCode: string;
  gridDescription: string;
  csvFile: File | null;
  gridData: any;
  
  // Rule data
  productType: string;
  systemType: string;
  priceGroup: string;
  
  // Created IDs
  createdGridId?: string;
  createdRuleId?: string;
}

export const PricingGridWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    gridName: '',
    gridCode: '',
    gridDescription: '',
    csvFile: null,
    gridData: null,
    productType: '',
    systemType: '',
    priceGroup: '',
  });

  const steps = [
    { 
      id: 'concept',
      title: 'Understanding Price Lists',
      description: 'How pricing works',
      icon: LinkIcon
    },
    { 
      id: 'upload',
      title: 'Upload Price List',
      description: 'Create your grid',
      icon: Upload
    },
    { 
      id: 'connect',
      title: 'Connect to Products',
      description: 'Set up routing',
      icon: LinkIcon
    },
    { 
      id: 'review',
      title: 'Review & Complete',
      description: 'Confirm setup',
      icon: CheckCircle2
    }
  ];

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 0: return true; // Concept - always can proceed
      case 1: // Upload
        return !!(wizardData.gridName && wizardData.gridCode && wizardData.csvFile);
      case 2: // Connect
        return !!(wizardData.productType && wizardData.createdGridId);
      case 3: return false; // Review - this is the last step
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Reset wizard
    setCurrentStep(0);
    setWizardData({
      gridName: '',
      gridCode: '',
      gridDescription: '',
      csvFile: null,
      gridData: null,
      productType: '',
      systemType: '',
      priceGroup: '',
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-2xl">Price List Setup Wizard</CardTitle>
          <CardDescription className="text-base">
            Follow these simple steps to set up pricing for your products
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Step Indicator */}
          <StepIndicator steps={steps} currentStep={currentStep} />

          {/* Step Content */}
          <div className="mt-8">
            {currentStep === 0 && (
              <ConceptDiagram />
            )}

            {currentStep === 1 && (
              <StepUploadGrid 
                wizardData={wizardData} 
                updateWizardData={updateWizardData}
              />
            )}

            {currentStep === 2 && (
              <StepConnectRule 
                wizardData={wizardData} 
                updateWizardData={updateWizardData}
              />
            )}

            {currentStep === 3 && (
              <StepReview 
                wizardData={wizardData}
                onComplete={handleComplete}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < steps.length - 1 && (
              <Button
                onClick={handleNext}
                disabled={!canProceedFromStep(currentStep)}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
