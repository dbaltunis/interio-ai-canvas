/**
 * DemoJobDetailTabs - EXTRACTED from JobDetailPage.tsx tabs section
 * Presentation-only version for tutorial demos - 100% visual accuracy
 * No hooks, no data fetching - accepts static props
 */

import React from "react";
import { User, Package, FileText, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

type TabValue = "details" | "rooms" | "quotation" | "workroom";

interface DemoJobDetailTabsProps {
  activeTab: TabValue;
  onTabChange?: (tab: TabValue) => void;
  highlightedTab?: TabValue | null;
  showWorkroom?: boolean;
  className?: string;
}

const tabs: { value: TabValue; label: string; icon: React.ElementType }[] = [
  { value: "details", label: "Client", icon: User },
  { value: "rooms", label: "Project", icon: Package },
  { value: "quotation", label: "Quote", icon: FileText },
  { value: "workroom", label: "Workroom", icon: Wrench },
];

export const DemoJobDetailTabs = ({
  activeTab,
  onTabChange,
  highlightedTab,
  showWorkroom = true,
  className,
}: DemoJobDetailTabsProps) => {
  const visibleTabs = showWorkroom ? tabs : tabs.filter(t => t.value !== "workroom");
  
  // EXACT tab styling from JobDetailPage.tsx
  return (
    <div className={cn("flex border-b border-border bg-card/30", className)}>
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;
        const isHighlighted = highlightedTab === tab.value;
        
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange?.(tab.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors relative",
              isActive 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground",
              isHighlighted && "ring-2 ring-primary ring-offset-1 rounded-t"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
