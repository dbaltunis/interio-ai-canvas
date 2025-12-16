import { motion } from 'framer-motion';
import { FileSpreadsheet, Tag, Package, Calculator, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  isLast?: boolean;
}

const FlowStep = ({ icon, title, description, delay, isLast }: FlowStepProps) => (
  <div className="flex items-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 text-primary">
        {icon}
      </div>
      <h4 className="font-semibold text-foreground text-sm mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-[120px]">{description}</p>
    </motion.div>
    
    {!isLast && (
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: delay + 0.2 }}
        className="mx-4 flex-shrink-0"
      >
        <ArrowRight className="w-6 h-6 text-primary/50" />
      </motion.div>
    )}
  </div>
);

export const FlowDiagram = ({ className }: { className?: string }) => {
  const steps = [
    {
      icon: <FileSpreadsheet className="w-7 h-7" />,
      title: "Upload Grid",
      description: "Import your pricing CSV file"
    },
    {
      icon: <Tag className="w-7 h-7" />,
      title: "Set Price Group",
      description: "Assign a unique group identifier"
    },
    {
      icon: <Package className="w-7 h-7" />,
      title: "Materials Match",
      description: "Inventory items with same group link automatically"
    },
    {
      icon: <Calculator className="w-7 h-7" />,
      title: "Auto-Price",
      description: "Quotes use grid prices automatically"
    }
  ];

  return (
    <div className={cn("py-8", className)}>
      <motion.h3
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-lg font-semibold text-center mb-8 text-foreground"
      >
        How Pricing Grids Work
      </motion.h3>
      
      <div className="flex flex-wrap justify-center items-start gap-2">
        {steps.map((step, index) => (
          <FlowStep
            key={step.title}
            {...step}
            delay={index * 0.15}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
      
      {/* Connection line (desktop) */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="hidden lg:block h-0.5 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 mx-auto mt-6 max-w-2xl"
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
};
