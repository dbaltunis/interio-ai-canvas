/**
 * DemoStatusBadge - EXTRACTED from JobStatusBadge.tsx lines 35-58
 * Presentation-only version for tutorial demos - 100% visual accuracy
 * No hooks, no data fetching - accepts static props
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DemoStatusBadgeProps {
  status: string;
  color: string;
  className?: string;
}

// EXACT color map from JobStatusBadge.tsx getStatusColor
const getStatusColor = (color: string) => {
  const colorMap: Record<string, string> = {
    'gray': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-200 dark:border-gray-600',
    'blue': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-600/30 dark:text-blue-200 dark:border-blue-500/50', 
    'green': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-600/30 dark:text-green-200 dark:border-green-500/50',
    'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-600/30 dark:text-yellow-200 dark:border-yellow-500/50',
    'orange': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-600/30 dark:text-orange-200 dark:border-orange-500/50',
    'red': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-600/30 dark:text-red-200 dark:border-red-500/50',
    'purple': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-600/30 dark:text-purple-200 dark:border-purple-500/50',
    'primary': 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/30 dark:text-primary dark:border-primary/50',
  };
  return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-200 dark:border-gray-600';
};

// Status labels matching database job_statuses
const statusLabels: Record<string, string> = {
  lead: "Lead",
  draft: "Draft",
  quote_sent: "Quote Sent",
  approved: "Approved",
  planning: "Planning",
  in_production: "In Production",
  completed: "Completed",
  rejected: "Rejected",
  order_confirmed: "Order Confirmed",
  review: "Review",
};

export const DemoStatusBadge = ({ status, color, className }: DemoStatusBadgeProps) => {
  const displayColor = getStatusColor(color);
  const displayLabel = statusLabels[status] || status;

  // EXACT JSX from JobStatusBadge.tsx return statement
  return (
    <Badge className={cn(`${displayColor} font-medium px-2 py-1 text-xs`, className)}>
      {displayLabel}
    </Badge>
  );
};
