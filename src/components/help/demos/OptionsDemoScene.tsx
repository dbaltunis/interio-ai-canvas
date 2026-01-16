import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DemoScene, AnimatedCursor, HighlightBox, TypingText } from "./DemoScene";

interface Step {
  cursorX: number;
  cursorY: number;
  highlight: string | null;
  clicking: boolean;
  description: string;
}

const demoSteps: Step[] = [
  { cursorX: 180, cursorY: 30, highlight: "add", clicking: true, description: "Click to create a new option type" },
  { cursorX: 100, cursorY: 80, highlight: "type", clicking: true, description: "Enter option name (e.g., 'Fabric')" },
  { cursorX: 100, cursorY: 130, highlight: "value", clicking: true, description: "Add option values with prices" },
  { cursorX: 150, cursorY: 160, highlight: "price", clicking: true, description: "Set price per square meter" },
  { cursorX: 180, cursorY: 200, highlight: "save", clicking: true, description: "Save to use in templates" },
];

export const OptionsDemoScene = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  
  const step = demoSteps[currentStep];
  const showForm = currentStep >= 1;
  
  return (
    <DemoScene>
      {/* Simulated options manager UI */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">Treatment Options</span>
          <HighlightBox active={step.highlight === "add"}>
            <button className="px-2 py-1 rounded bg-primary text-primary-foreground text-[10px] font-medium">
              + Add Option
            </button>
          </HighlightBox>
        </div>
        
        {/* Existing options list */}
        <div className="space-y-1.5">
          <div className="p-2 rounded border bg-card">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-medium">Control Type</div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">4 values</span>
            </div>
            <div className="flex gap-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Chain</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Motor</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">+2</span>
            </div>
          </div>
        </div>
        
        {/* Form overlay */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-3 top-16 p-3 rounded-lg border bg-card shadow-lg space-y-3"
          >
            <div className="text-xs font-medium">New Option Type</div>
            
            <HighlightBox active={step.highlight === "type"}>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Option Name</label>
                <div className="px-2 py-1.5 rounded border bg-background text-xs">
                  {currentStep >= 2 ? <TypingText text="Fabric" /> : ""}
                </div>
              </div>
            </HighlightBox>
            
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground">Values</label>
              
              <HighlightBox active={step.highlight === "value"}>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 px-2 py-1.5 rounded border bg-background text-xs">
                    {currentStep >= 3 ? "Sheer White" : ""}
                  </div>
                  <HighlightBox active={step.highlight === "price"}>
                    <div className="w-16 px-2 py-1.5 rounded border bg-background text-xs">
                      {currentStep >= 4 ? "$45/m²" : ""}
                    </div>
                  </HighlightBox>
                </div>
              </HighlightBox>
              
              <div className="flex gap-2 items-center opacity-50">
                <div className="flex-1 px-2 py-1.5 rounded border bg-background text-xs text-muted-foreground">
                  + Add value
                </div>
              </div>
            </div>
            
            <HighlightBox active={step.highlight === "save"}>
              <button className="w-full py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium">
                Save Option
              </button>
            </HighlightBox>
          </motion.div>
        )}
      </div>
      
      {/* Animated cursor */}
      <AnimatedCursor x={step.cursorX} y={step.cursorY} clicking={step.clicking} />
      
      {/* Step description */}
      <div className="absolute bottom-2 left-2 right-2 text-center">
        <span className="text-[10px] text-muted-foreground bg-background/80 px-2 py-1 rounded">
          {step.description}
        </span>
      </div>
    </DemoScene>
  );
};
