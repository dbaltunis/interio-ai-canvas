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
  { cursorX: 180, cursorY: 30, highlight: "add", clicking: true, description: "Click 'Add Heading' to create a new style" },
  { cursorX: 100, cursorY: 80, highlight: "name", clicking: true, description: "Enter the heading name" },
  { cursorX: 100, cursorY: 120, highlight: "fullness", clicking: true, description: "Set the fullness ratio for fabric" },
  { cursorX: 100, cursorY: 160, highlight: "price", clicking: true, description: "Add pricing per meter" },
  { cursorX: 180, cursorY: 200, highlight: "save", clicking: true, description: "Save your new heading style" },
];

export const HeadingsDemoScene = () => {
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
      {/* Simulated headings manager UI */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">Heading Styles</span>
          <HighlightBox active={step.highlight === "add"}>
            <button className="px-2 py-1 rounded bg-primary text-primary-foreground text-[10px] font-medium">
              + Add Heading
            </button>
          </HighlightBox>
        </div>
        
        {/* Existing headings list */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-2 rounded border bg-card">
            <div>
              <div className="text-xs font-medium">Triple Pinch Pleat</div>
              <div className="text-[10px] text-muted-foreground">2.5x fullness</div>
            </div>
            <div className="text-xs text-primary">$12.50/m</div>
          </div>
          <div className="flex items-center justify-between p-2 rounded border bg-card opacity-60">
            <div>
              <div className="text-xs font-medium">S-Fold Wave</div>
              <div className="text-[10px] text-muted-foreground">2.0x fullness</div>
            </div>
            <div className="text-xs text-primary">$15.00/m</div>
          </div>
        </div>
        
        {/* Form overlay */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-3 top-16 p-3 rounded-lg border bg-card shadow-lg space-y-3"
          >
            <div className="text-xs font-medium">New Heading Style</div>
            
            <HighlightBox active={step.highlight === "name"}>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Name</label>
                <div className="px-2 py-1.5 rounded border bg-background text-xs">
                  {currentStep >= 2 ? <TypingText text="Goblet Pleat" /> : ""}
                </div>
              </div>
            </HighlightBox>
            
            <HighlightBox active={step.highlight === "fullness"}>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Fullness Ratio</label>
                <div className="px-2 py-1.5 rounded border bg-background text-xs">
                  {currentStep >= 3 ? "2.3x" : ""}
                </div>
              </div>
            </HighlightBox>
            
            <HighlightBox active={step.highlight === "price"}>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Price per Meter</label>
                <div className="px-2 py-1.5 rounded border bg-background text-xs">
                  {currentStep >= 4 ? "$18.00" : ""}
                </div>
              </div>
            </HighlightBox>
            
            <HighlightBox active={step.highlight === "save"}>
              <button className="w-full py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium">
                Save Heading
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
