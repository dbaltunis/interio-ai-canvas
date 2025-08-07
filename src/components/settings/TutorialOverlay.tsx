import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight, Play, Download } from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetTab?: string;
  highlight?: string;
  example?: string;
  downloadable?: boolean;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Settings Setup",
    description: "Let's set up your window covering calculation system in 4 easy steps. This will take about 5 minutes.",
  },
  {
    id: "templates",
    title: "1. Create Product Templates",
    description: "First, define your main products (Curtains, Roman Blinds, etc.) and how they're calculated.",
    targetTab: "products",
    example: "Curtains: Width × Drop with per-linear-meter pricing"
  },
  {
    id: "components",
    title: "2. Add Your Components",
    description: "Set up headings (Pencil Pleat 2.0x), hardware, linings, and upload CSV pricing grids for blinds.",
    targetTab: "components",
    example: "Pencil Pleat: 2.0x fullness, $15/meter"
  },
  {
    id: "csv-grids",
    title: "3. Upload CSV Pricing Grids",
    description: "For blinds, upload your existing pricing tables. We'll show you the exact format needed.",
    targetTab: "components",
    downloadable: true,
    example: "Roman Blinds: Width ranges (columns) × Height ranges (rows) = Price in each cell"
  },
  {
    id: "complete",
    title: "Setup Complete!",
    description: "You're ready to create quotes! Your settings will now be used in job creation to calculate prices automatically.",
  }
];

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange?: (tab: string) => void;
}

export const TutorialOverlay = ({ isOpen, onClose, onTabChange }: TutorialOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (tutorialSteps[nextStep].targetTab && onTabChange) {
        onTabChange(tutorialSteps[nextStep].targetTab!);
      }
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (tutorialSteps[prevStep].targetTab && onTabChange) {
        onTabChange(tutorialSteps[prevStep].targetTab!);
      }
    }
  };

  const downloadCSVExample = () => {
    const csvContent = `Width/Height,100-150cm,151-200cm,201-250cm,251-300cm
60-100cm,125.00,145.00,165.00,185.00
101-150cm,145.00,165.00,185.00,205.00
151-200cm,165.00,185.00,205.00,225.00
201-250cm,185.00,205.00,225.00,245.00`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roman-blinds-pricing-example.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl animate-scale-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-brand-primary" />
                <CardTitle>Setup Guide</CardTitle>
              </div>
              <Badge variant="outline">
                Step {currentStep + 1} of {tutorialSteps.length}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-brand-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-brand-primary">
              {step.title}
            </h3>
            <p className="text-brand-neutral leading-relaxed">
              {step.description}
            </p>
            
            {step.example && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Example:</h4>
                <p className="text-blue-800 text-sm">{step.example}</p>
              </div>
            )}

            {step.downloadable && (
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={downloadCSVExample}
                  className="text-brand-primary border-brand-primary hover:bg-brand-primary hover:text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Example CSV
                </Button>
              </div>
            )}

            {/* Visual indicators for different steps */}
            {step.id === "templates" && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <h5 className="font-medium text-green-900">Curtains</h5>
                  <p className="text-xs text-green-700">Width × Drop</p>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <h5 className="font-medium text-blue-900">Roman Blinds</h5>
                  <p className="text-xs text-blue-700">Width × Height</p>
                </div>
              </div>
            )}

            {step.id === "components" && (
              <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                <div className="bg-primary/10 p-2 rounded">
                  <strong>Headings</strong><br/>
                  Pencil Pleat 2.0x
                </div>
                <div className="bg-orange-50 p-2 rounded">
                  <strong>Hardware</strong><br/>
                  Tracks & Rods
                </div>
                <div className="bg-teal-50 p-2 rounded">
                  <strong>Linings</strong><br/>
                  Standard/Blackout
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <span className="text-sm text-brand-neutral">
              {currentStep + 1} / {tutorialSteps.length}
            </span>
            
            <Button 
              onClick={handleNext}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              {isLastStep ? 'Start Using Settings' : 'Next'}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};