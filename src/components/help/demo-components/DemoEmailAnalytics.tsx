/**
 * DemoEmailAnalytics - Extracted from EmailAnalyticsDashboard.tsx
 * Presentation-only version for tutorial demos - 100% visual accuracy
 * No hooks, no data fetching - accepts static props
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle2, Eye, MousePointerClick, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: any;
  color: string;
  highlighted?: boolean;
}

const DemoKPICard = ({ title, value, change, icon: Icon, color, highlighted }: KPICardProps) => (
  <Card className={cn(
    "overflow-hidden transition-all",
    highlighted && "ring-2 ring-primary"
  )}>
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-start justify-between gap-1">
        <div className="space-y-0.5 min-w-0 flex-1">
          <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">{title}</p>
          <p className="text-base sm:text-lg font-bold leading-tight">{value}</p>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-0.5 text-[8px] sm:text-[9px]",
              change >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {change >= 0 ? <TrendingUp className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0" /> : <TrendingDown className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0" />}
              <span className="truncate">{Math.abs(change)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={cn("p-1.5 sm:p-2 rounded-full flex-shrink-0", color)}>
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

interface DemoEmailAnalyticsProps {
  highlightedCard?: "sent" | "delivered" | "opened" | "clicked";
}

export const DemoEmailAnalytics = ({ highlightedCard }: DemoEmailAnalyticsProps) => {
  const kpis = [
    { key: "sent", title: "Emails Sent", value: "2,847", change: 12, icon: Send, color: "bg-blue-500" },
    { key: "delivered", title: "Delivered", value: "2,801", change: 8, icon: CheckCircle2, color: "bg-green-500" },
    { key: "opened", title: "Open Rate", value: "42.3%", change: 5, icon: Eye, color: "bg-purple-500" },
    { key: "clicked", title: "Click Rate", value: "18.7%", change: -2, icon: MousePointerClick, color: "bg-orange-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
      {kpis.map((kpi) => (
        <DemoKPICard
          key={kpi.key}
          {...kpi}
          highlighted={highlightedCard === kpi.key}
        />
      ))}
    </div>
  );
};

// Simple mini chart for demos
export const DemoMiniChart = ({ highlighted = false }: { highlighted?: boolean }) => (
  <Card className={cn(
    "overflow-hidden",
    highlighted && "ring-2 ring-primary"
  )}>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Email Activity</h3>
        <span className="text-xs text-muted-foreground">Last 7 days</span>
      </div>
      {/* Simplified chart visualization */}
      <div className="h-32 flex items-end gap-1">
        {[45, 62, 38, 71, 55, 89, 67].map((value, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-primary/20 rounded-t relative overflow-hidden"
              style={{ height: `${value}%` }}
            >
              <div 
                className="absolute bottom-0 w-full bg-primary rounded-t transition-all"
                style={{ height: `${value * 0.6}%` }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
