import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Play, ChevronRight, ChevronLeft, MousePointer2, Download, CheckCircle } from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  targetElement?: string;
  inputValue?: string;
  expectedResult?: string;
  tips?: string[];
}

const onboardingFlow: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Window Covering Calculator",
    description: "Let's set up your first curtain calculation in 3 minutes. You'll see exactly how your clients will experience this.",
    action: "click-start"
  },
  {
    id: "create-template",
    title: "Create Your First Product Template",
    description: "We'll create a 'Curtains' template. Watch the mouse guide you!",
    action: "input-name",
    targetElement: "template-name",
    inputValue: "Premium Curtains",
    tips: ["This is what your clients will see in their quote", "Use descriptive names like 'Premium Curtains' or 'Budget Roman Blinds'"]
  },
  {
    id: "select-calculation",
    title: "Choose Calculation Method",
    description: "For curtains, we measure by Width × Drop. This matches how you probably calculate now.",
    action: "select-dropdown",
    targetElement: "calculation-method",
    inputValue: "width-drop",
    expectedResult: "Width × Drop selected"
  },
  {
    id: "set-pricing",
    title: "Set Your Pricing Unit",
    description: "Most curtain makers charge per linear meter. Change this to match your pricing.",
    action: "select-dropdown",
    targetElement: "pricing-unit",
    inputValue: "per-linear-meter",
    expectedResult: "Per Linear Meter selected"
  },
  {
    id: "add-base-cost",
    title: "Add Your Making Cost",
    description: "What do you charge to make 1 linear meter of curtains? (excluding fabric)",
    action: "input-number",
    targetElement: "base-cost",
    inputValue: "45.00",
    tips: ["This is your labor cost only", "Fabric cost gets added separately", "Include your desired profit margin"]
  },
  {
    id: "create-heading",
    title: "Add Your First Heading Option",
    description: "Let's add a Pencil Pleat heading - the most common choice.",
    action: "click-button",
    targetElement: "add-heading-btn"
  },
  {
    id: "heading-details",
    title: "Configure Pencil Pleat Details",
    description: "Set the fullness ratio and your price for this heading style.",
    action: "input-multiple",
    targetElement: "heading-form",
    expectedResult: "Pencil Pleat created with 2.0x fullness"
  },
  {
    id: "test-calculation",
    title: "Test Your Setup",
    description: "Let's calculate a real quote: 2.5m wide × 2.8m drop curtains with Pencil Pleat",
    action: "calculate-demo",
    expectedResult: "Total: $387.50 (5m fabric × 2.0 fullness × $45/m + heading cost)"
  },
  {
    id: "csv-upload",
    title: "Upload Roman Blind Pricing Grid",
    description: "Now let's add a CSV pricing table for Roman Blinds. This is where most people get stuck - but we make it easy!",
    action: "upload-csv",
    tips: ["Download our example CSV first", "Your existing Excel pricing can be saved as CSV", "Width ranges go in top row, heights in first column"]
  },
  {
    id: "complete",
    title: "You're Ready to Quote!",
    description: "Your setup is complete. Your clients can now get instant, accurate quotes that match your pricing exactly.",
    action: "celebration"
  }
];

interface InteractiveOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveOnboarding = ({ isOpen, onClose }: InteractiveOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showMouse, setShowMouse] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [demoInputs, setDemoInputs] = useState({
    templateName: "",
    calculationMethod: "",
    pricingUnit: "",
    baseCost: "",
    headingName: "Pencil Pleat",
    headingFullness: "2.0",
    headingPrice: "15.00"
  });

  const overlayRef = useRef<HTMLDivElement>(null);

  const step = onboardingFlow[currentStep];

  const animateMouseTo = (elementId: string, callback?: () => void) => {
    const element = document.getElementById(elementId);
    if (element && overlayRef.current) {
      const rect = element.getBoundingClientRect();
      const overlayRect = overlayRef.current.getBoundingClientRect();
      
      setShowMouse(true);
      setMousePosition({
        x: rect.left + rect.width / 2 - overlayRect.left,
        y: rect.top + rect.height / 2 - overlayRect.top
      });

      setTimeout(() => {
        if (callback) callback();
      }, 1500);
    }
  };

  const handleStepAction = () => {
    const stepId = step.id;
    
    switch (step.action) {
      case "input-name":
        setDemoInputs(prev => ({ ...prev, templateName: step.inputValue || "" }));
        animateMouseTo("demo-template-name");
        break;
      case "select-dropdown":
        if (step.targetElement === "calculation-method") {
          setDemoInputs(prev => ({ ...prev, calculationMethod: "Width × Drop (Curtains)" }));
        } else if (step.targetElement === "pricing-unit") {
          setDemoInputs(prev => ({ ...prev, pricingUnit: "Per Linear Meter" }));
        }
        break;
      case "input-number":
        setDemoInputs(prev => ({ ...prev, baseCost: step.inputValue || "" }));
        break;
    }

    setCompletedSteps(prev => [...prev, stepId]);
    
    setTimeout(() => {
      if (currentStep < onboardingFlow.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-hidden" ref={overlayRef}>
      {/* Animated Mouse Cursor */}
      {showMouse && (
        <div 
          className="absolute pointer-events-none z-60 transition-all duration-1500 ease-out"
          style={{ 
            left: mousePosition.x, 
            top: mousePosition.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <MousePointer2 className="h-6 w-6 text-yellow-400 animate-pulse" />
        </div>
      )}

      {/* Main Tutorial Panel */}
      <div className="absolute right-4 top-4 bottom-4 w-96 bg-white rounded-lg shadow-2xl flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Interactive Setup</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / onboardingFlow.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Step {currentStep + 1} of {onboardingFlow.length}
          </p>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>

            {step.tips && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 text-sm mb-2">💡 Pro Tips:</h4>
                <ul className="space-y-1">
                  {step.tips.map((tip, index) => (
                    <li key={index} className="text-blue-800 text-xs flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step.expectedResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900 text-sm">Expected Result:</span>
                </div>
                <p className="text-green-800 text-xs mt-1">{step.expectedResult}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          {step.action === "celebration" ? (
            <Button 
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              🎉 Start Creating Quotes!
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleStepAction}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {step.action === "click-start" ? "Let's Start!" : "Continue"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Demo UI */}
      <div className="absolute left-4 top-4 bottom-4 right-[420px] bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Demo Header */}
          <div className="bg-gray-900 text-white p-4">
            <h2 className="text-xl font-bold">Window Covering Calculator - Demo</h2>
            <p className="text-gray-300 text-sm">Follow the guide to set up your first product</p>
          </div>

          {/* Demo Content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Product Template Form */}
            <Card className={step.id.includes("template") || step.id.includes("create") ? "ring-2 ring-blue-500 ring-opacity-50" : ""}>
              <CardHeader>
                <CardTitle>Create Product Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="demo-template-name">Product Name</Label>
                  <Input 
                    id="demo-template-name"
                    value={demoInputs.templateName}
                    placeholder="e.g., Premium Curtains"
                    className={step.targetElement === "template-name" ? "ring-2 ring-yellow-400" : ""}
                  />
                </div>
                
                <div>
                  <Label>Calculation Method</Label>
                  <Select value={demoInputs.calculationMethod}>
                    <SelectTrigger className={step.targetElement === "calculation-method" ? "ring-2 ring-yellow-400" : ""}>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="width-drop">Width × Drop (Curtains)</SelectItem>
                      <SelectItem value="width-height">Width × Height (Blinds)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Pricing Unit</Label>
                  <Select value={demoInputs.pricingUnit}>
                    <SelectTrigger className={step.targetElement === "pricing-unit" ? "ring-2 ring-yellow-400" : ""}>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per-linear-meter">Per Linear Meter</SelectItem>
                      <SelectItem value="per-sqm">Per Square Meter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="demo-base-cost">Base Making Cost ($)</Label>
                  <Input 
                    id="demo-base-cost"
                    type="number"
                    value={demoInputs.baseCost}
                    placeholder="45.00"
                    className={step.targetElement === "base-cost" ? "ring-2 ring-yellow-400" : ""}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Heading Options */}
            {currentStep >= 5 && (
              <Card className={step.id.includes("heading") ? "ring-2 ring-blue-500 ring-opacity-50" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Heading Options</CardTitle>
                    <Button 
                      id="add-heading-btn"
                      size="sm" 
                      className={step.targetElement === "add-heading-btn" ? "ring-2 ring-yellow-400" : ""}
                    >
                      Add Heading
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {completedSteps.includes("add-heading") && (
                    <div className="border rounded-lg p-3 bg-green-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Pencil Pleat</h4>
                          <p className="text-sm text-gray-600">Fullness: 2.0x • Price: $15.00/meter</p>
                        </div>
                        <Switch checked />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Live Calculation Preview */}
            {currentStep >= 7 && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Live Quote Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Curtain Size:</span>
                      <span>2.5m × 2.8m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fabric Required:</span>
                      <span>5.0m (2.5m × 2.0 fullness)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Making Cost:</span>
                      <span>$225.00 (5m × $45)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pencil Pleat:</span>
                      <span>$37.50 (2.5m × $15)</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-green-800">
                      <span>Total (exc. fabric):</span>
                      <span>$262.50</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};