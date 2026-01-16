import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DemoScene, AnimatedCursor, HighlightBox } from "./DemoScene";

interface Step {
  cursorX: number;
  cursorY: number;
  highlight: string | null;
  clicking: boolean;
  description: string;
}

const demoSteps: Step[] = [
  { cursorX: 20, cursorY: 20, highlight: null, clicking: false, description: "Set default manufacturing values" },
  { cursorX: 150, cursorY: 60, highlight: "hem", clicking: true, description: "Adjust hem allowance for fabric" },
  { cursorX: 150, cursorY: 100, highlight: "side", clicking: true, description: "Set side turn allowances" },
  { cursorX: 150, cursorY: 140, highlight: "waste", clicking: true, description: "Configure waste percentage" },
  { cursorX: 180, cursorY: 190, highlight: "save", clicking: true, description: "Save as account defaults" },
];

export const DefaultsDemoScene = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  
  const step = demoSteps[currentStep];
  
  return (
    <DemoScene>
      {/* Simulated defaults UI */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">Manufacturing Defaults</span>
        </div>
        
        {/* Settings list */}
        <div className="space-y-2">
          <HighlightBox active={step.highlight === "hem"}>
            <div className="flex items-center justify-between p-2 rounded border bg-card">
              <div>
                <div className="text-xs font-medium">Hem Allowance</div>
                <div className="text-[10px] text-muted-foreground">Bottom hem for curtains</div>
              </div>
              <motion.div 
                className="flex items-center gap-1"
                animate={{ scale: step.highlight === "hem" ? 1.1 : 1 }}
              >
                <button className="w-5 h-5 rounded bg-muted text-xs">-</button>
                <span className="w-10 text-center text-xs font-medium">
                  {currentStep >= 2 ? "15cm" : "10cm"}
                </span>
                <button className="w-5 h-5 rounded bg-muted text-xs">+</button>
              </motion.div>
            </div>
          </HighlightBox>
          
          <HighlightBox active={step.highlight === "side"}>
            <div className="flex items-center justify-between p-2 rounded border bg-card">
              <div>
                <div className="text-xs font-medium">Side Turn</div>
                <div className="text-[10px] text-muted-foreground">Side hems each edge</div>
              </div>
              <motion.div 
                className="flex items-center gap-1"
                animate={{ scale: step.highlight === "side" ? 1.1 : 1 }}
              >
                <button className="w-5 h-5 rounded bg-muted text-xs">-</button>
                <span className="w-10 text-center text-xs font-medium">
                  {currentStep >= 3 ? "4cm" : "3cm"}
                </span>
                <button className="w-5 h-5 rounded bg-muted text-xs">+</button>
              </motion.div>
            </div>
          </HighlightBox>
          
          <HighlightBox active={step.highlight === "waste"}>
            <div className="flex items-center justify-between p-2 rounded border bg-card">
              <div>
                <div className="text-xs font-medium">Waste Percentage</div>
                <div className="text-[10px] text-muted-foreground">Extra for cutting waste</div>
              </div>
              <motion.div 
                className="flex items-center gap-1"
                animate={{ scale: step.highlight === "waste" ? 1.1 : 1 }}
              >
                <button className="w-5 h-5 rounded bg-muted text-xs">-</button>
                <span className="w-10 text-center text-xs font-medium">
                  {currentStep >= 4 ? "8%" : "5%"}
                </span>
                <button className="w-5 h-5 rounded bg-muted text-xs">+</button>
              </motion.div>
            </div>
          </HighlightBox>
        </div>
        
        {/* Save button */}
        <HighlightBox active={step.highlight === "save"}>
          <button className="w-full py-2 rounded bg-primary text-primary-foreground text-xs font-medium">
            Save Defaults
          </button>
        </HighlightBox>
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
