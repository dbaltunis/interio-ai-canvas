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
  { cursorX: 20, cursorY: 20, highlight: null, clicking: false, description: "Browse the supplier catalog to find products" },
  { cursorX: 80, cursorY: 70, highlight: "search", clicking: true, description: "Search for a specific product type" },
  { cursorX: 120, cursorY: 120, highlight: "product", clicking: true, description: "Click on a product to view details" },
  { cursorX: 200, cursorY: 180, highlight: "import", clicking: true, description: "Import product as a template" },
  { cursorX: 150, cursorY: 140, highlight: null, clicking: false, description: "Product added to your templates!" },
];

export const SuppliersDemoScene = () => {
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
      {/* Simulated supplier browser UI */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">Supplier Catalog</span>
          <div className="flex gap-1">
            <div className="w-16 h-2 rounded bg-muted" />
          </div>
        </div>
        
        {/* Search bar */}
        <HighlightBox active={step.highlight === "search"}>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded border bg-background">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            <motion.span 
              className="text-xs text-muted-foreground"
              animate={{ opacity: step.highlight === "search" ? 1 : 0.5 }}
            >
              {step.highlight === "search" ? "roller blinds..." : "Search products..."}
            </motion.span>
          </div>
        </HighlightBox>
        
        {/* Product grid */}
        <div className="grid grid-cols-2 gap-2">
          <HighlightBox active={step.highlight === "product"}>
            <div className="p-2 rounded border bg-card">
              <div className="w-full h-12 rounded bg-gradient-to-br from-blue-100 to-blue-200 mb-2" />
              <div className="text-xs font-medium truncate">Roller Blind</div>
              <div className="text-[10px] text-muted-foreground">$45.00/sqm</div>
            </div>
          </HighlightBox>
          
          <div className="p-2 rounded border bg-card opacity-60">
            <div className="w-full h-12 rounded bg-gradient-to-br from-amber-100 to-amber-200 mb-2" />
            <div className="text-xs font-medium truncate">Roman Shade</div>
            <div className="text-[10px] text-muted-foreground">$65.00/sqm</div>
          </div>
        </div>
        
        {/* Import button overlay */}
        {currentStep >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-4 bottom-12 p-3 rounded-lg border bg-card shadow-lg"
          >
            <div className="text-xs font-medium mb-2">Roller Blind - Standard</div>
            <HighlightBox active={step.highlight === "import"}>
              <button className="w-full py-1.5 px-3 rounded bg-primary text-primary-foreground text-xs font-medium">
                Import as Template
              </button>
            </HighlightBox>
          </motion.div>
        )}
        
        {/* Success message */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-background/80"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-700 text-xs font-medium">
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">✓</div>
              Template imported!
            </div>
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
