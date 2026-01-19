/**
 * DemoStageBadge - Presentation-only version extracted from ClientListView.tsx getStageColor
 * 100% visual accuracy with no data dependencies
 */

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

type FunnelStage = "lead" | "contacted" | "qualified" | "proposal" | "negotiation" | "approved" | "lost" | "client";

interface DemoStageBadgeProps {
  stage: FunnelStage;
  highlighted?: boolean;
  pulse?: boolean;
  size?: "sm" | "xs";
}

// Exact color mapping from ClientListView.tsx getStageColor (lines 202-229)
const getStageColor = (stage: string) => {
  switch (stage?.toLowerCase()) {
    case 'lead':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'contacted':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'qualified':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'proposal':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'negotiation':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'approved':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'lost':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'client':
      return 'bg-primary/10 text-primary border-primary/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export const DemoStageBadge = ({ 
  stage, 
  highlighted = false,
  pulse = false,
  size = "sm" 
}: DemoStageBadgeProps) => {
  const stageColor = getStageColor(stage);
  
  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <Badge 
        variant="outline" 
        className={`${stageColor} border ${size === "xs" ? "text-[9px] px-1.5 py-0.5" : "text-xs"} font-medium rounded-md ${
          highlighted ? "ring-2 ring-primary ring-offset-1" : ""
        }`}
      >
        {stage.replace('_', ' ').toUpperCase()}
      </Badge>
    </motion.div>
  );
};
