import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoScene, AnimatedCursor, HighlightBox } from "./DemoScene";
import { Plus, Package } from "lucide-react";

interface Step {
  id: number;
  cursorPos: { x: number; y: number };
  highlight: string | null;
  clicking: boolean;
  description: string;
}

const demoSteps: Step[] = [
  { id: 1, cursorPos: { x: 20, y: 20 }, highlight: null, clicking: false, description: "Let's create a new template" },
  { id: 2, cursorPos: { x: 260, y: 45 }, highlight: "add-button", clicking: false, description: "Click the Add Template button" },
  { id: 3, cursorPos: { x: 260, y: 45 }, highlight: "add-button", clicking: true, description: "Click!" },
  { id: 4, cursorPos: { x: 150, y: 120 }, highlight: "form", clicking: false, description: "Fill in the template details" },
  { id: 5, cursorPos: { x: 150, y: 180 }, highlight: "category", clicking: false, description: "Select a product category" },
];

export const TemplatesDemoScene = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= demoSteps.length - 1) {
          return 0; // Loop back
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const step = demoSteps[currentStep];

  return (
    <DemoScene className="relative">
      {/* Simulated UI */}
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">My Templates</span>
          </div>
          <HighlightBox active={step.highlight === "add-button"}>
            <motion.button
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md"
              whileHover={{ scale: 1.02 }}
            >
              <Plus className="h-3 w-3" />
              Add Template
            </motion.button>
          </HighlightBox>
        </div>

        {/* Template cards */}
        <div className="grid gap-2">
          {["Roller Blind - Standard", "S-Fold Curtain", "Roman Blind"].map((name, i) => (
            <motion.div
              key={name}
              className="flex items-center justify-between p-2 rounded-md border bg-card text-xs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <span>{name}</span>
              <span className="text-muted-foreground">Active</span>
            </motion.div>
          ))}
        </div>

        {/* Form overlay (shows on step 4+) */}
        <AnimatePresence>
          {currentStep >= 3 && (
            <motion.div
              className="absolute inset-4 bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <HighlightBox active={step.highlight === "form"} className="space-y-3">
                <h4 className="text-sm font-semibold">New Template</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Name</label>
                    <div className="h-7 rounded-md border bg-background px-2 flex items-center text-xs">
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: "auto" }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        Venetian Blind
                      </motion.span>
                      <motion.span
                        className="w-0.5 h-4 bg-primary ml-0.5"
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      />
                    </div>
                  </div>
                  <HighlightBox active={step.highlight === "category"}>
                    <label className="text-xs text-muted-foreground">Category</label>
                    <div className="h-7 rounded-md border bg-background px-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Select category...</span>
                      <span className="text-muted-foreground">▼</span>
                    </div>
                  </HighlightBox>
                </div>
              </HighlightBox>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Animated cursor */}
      <AnimatedCursor 
        x={step.cursorPos.x} 
        y={step.cursorPos.y} 
        clicking={step.clicking} 
      />

      {/* Step description */}
      <div className="absolute bottom-2 left-2 right-2">
        <motion.div
          key={step.id}
          className="text-xs text-center text-muted-foreground bg-muted/80 backdrop-blur-sm rounded px-2 py-1"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {step.description}
        </motion.div>
      </div>
    </DemoScene>
  );
};
