import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

export interface DemoStep {
  id: string;
  title: string;
  description?: string;
  // Visual representation of what's shown
  visual: {
    type: "form" | "list" | "grid" | "action" | "result";
    elements?: DemoElement[];
    highlight?: string; // ID of element to highlight
  };
  // Cursor animation
  cursor?: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    action?: "click" | "type" | "drag";
  };
}

interface DemoElement {
  id: string;
  type: "button" | "input" | "card" | "text" | "icon" | "toggle";
  label: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  variant?: "primary" | "secondary" | "muted";
}

interface AnimatedDemoStepProps {
  step: DemoStep;
}

export const AnimatedDemoStep = ({ step }: AnimatedDemoStepProps) => {
  const renderVisual = () => {
    switch (step.visual.type) {
      case "form":
        return <FormVisual elements={step.visual.elements} highlight={step.visual.highlight} />;
      case "list":
        return <ListVisual elements={step.visual.elements} highlight={step.visual.highlight} />;
      case "grid":
        return <GridVisual elements={step.visual.elements} highlight={step.visual.highlight} />;
      case "action":
        return <ActionVisual elements={step.visual.elements} highlight={step.visual.highlight} />;
      case "result":
        return <ResultVisual elements={step.visual.elements} highlight={step.visual.highlight} />;
      default:
        return <PlaceholderVisual />;
    }
  };

  return (
    <div className="relative w-full h-full p-4">
      {renderVisual()}
      
      {/* Animated Cursor */}
      {step.cursor && (
        <motion.div
          className="absolute z-10 pointer-events-none"
          initial={{ x: step.cursor.startX, y: step.cursor.startY, opacity: 0 }}
          animate={{ 
            x: step.cursor.endX, 
            y: step.cursor.endY,
            opacity: 1 
          }}
          transition={{ 
            duration: 1.5, 
            ease: "easeInOut",
            delay: 0.3
          }}
        >
          <MousePointer2 className="h-5 w-5 text-primary fill-primary/20" />
          {step.cursor.action === "click" && (
            <motion.div
              className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-primary/20"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ delay: 1.5, duration: 0.4 }}
            />
          )}
        </motion.div>
      )}
    </div>
  );
};

// Visual Components for different step types

const FormVisual = ({ elements, highlight }: { elements?: DemoElement[]; highlight?: string }) => (
  <div className="space-y-3">
    <div className="h-2 w-24 bg-muted rounded" />
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <motion.div 
          key={i}
          className={`h-8 rounded border ${highlight === `input-${i}` ? 'border-primary bg-primary/5' : 'border-muted bg-background'}`}
          animate={highlight === `input-${i}` ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.5, repeat: highlight === `input-${i}` ? Infinity : 0, repeatDelay: 1 }}
        />
      ))}
    </div>
    <div className="flex justify-end">
      <motion.div 
        className={`h-8 w-20 rounded ${highlight === 'save' ? 'bg-primary' : 'bg-muted'}`}
        animate={highlight === 'save' ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5, repeat: highlight === 'save' ? Infinity : 0, repeatDelay: 1 }}
      />
    </div>
  </div>
);

const ListVisual = ({ elements, highlight }: { elements?: DemoElement[]; highlight?: string }) => (
  <div className="space-y-2">
    {[1, 2, 3, 4].map((i) => (
      <motion.div 
        key={i}
        className={`h-10 rounded border flex items-center px-3 gap-2 ${highlight === `item-${i}` ? 'border-primary bg-primary/5' : 'border-muted bg-background'}`}
        animate={highlight === `item-${i}` ? { x: [0, 4, 0] } : {}}
        transition={{ duration: 0.3, repeat: highlight === `item-${i}` ? Infinity : 0, repeatDelay: 2 }}
      >
        <div className="h-4 w-4 rounded bg-muted" />
        <div className="h-2 flex-1 bg-muted rounded" />
        <div className="h-2 w-8 bg-muted rounded" />
      </motion.div>
    ))}
  </div>
);

const GridVisual = ({ elements, highlight }: { elements?: DemoElement[]; highlight?: string }) => (
  <div className="grid grid-cols-3 gap-2">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <motion.div 
        key={i}
        className={`aspect-square rounded border flex items-center justify-center ${highlight === `grid-${i}` ? 'border-primary bg-primary/5' : 'border-muted bg-background'}`}
        animate={highlight === `grid-${i}` ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.4, repeat: highlight === `grid-${i}` ? Infinity : 0, repeatDelay: 1.5 }}
      >
        <div className="h-4 w-4 rounded bg-muted" />
      </motion.div>
    ))}
  </div>
);

const ActionVisual = ({ elements, highlight }: { elements?: DemoElement[]; highlight?: string }) => (
  <div className="flex flex-col items-center justify-center h-full space-y-4">
    <motion.div 
      className={`h-12 w-12 rounded-full ${highlight === 'action' ? 'bg-primary' : 'bg-muted'} flex items-center justify-center`}
      animate={highlight === 'action' ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.5, repeat: highlight === 'action' ? Infinity : 0, repeatDelay: 1 }}
    >
      <div className="h-5 w-5 rounded bg-background/50" />
    </motion.div>
    <div className="h-2 w-20 bg-muted rounded" />
  </div>
);

const ResultVisual = ({ elements, highlight }: { elements?: DemoElement[]; highlight?: string }) => (
  <div className="flex flex-col items-center justify-center h-full space-y-3">
    <motion.div 
      className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <motion.div 
        className="h-8 w-8 rounded-full bg-green-500"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      />
    </motion.div>
    <motion.div 
      className="h-2 w-24 bg-muted rounded"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    />
  </div>
);

const PlaceholderVisual = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-xs text-muted-foreground">Demo content</div>
  </div>
);
