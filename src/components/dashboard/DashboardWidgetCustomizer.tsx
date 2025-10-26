import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowUp, 
  ArrowDown, 
  ShoppingBag, 
  Users, 
  Calendar, 
  Mail, 
  BarChart3, 
  DollarSign,
  Link2,
  Briefcase,
  Maximize2,
  Minimize2,
  Square
} from "lucide-react";
import { DashboardWidget } from "@/hooks/useDashboardWidgets";
import { cn } from "@/lib/utils";

interface DashboardWidgetCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgets: DashboardWidget[];
  onToggle: (widgetId: string) => void;
  onReorder: (widgetId: string, direction: "up" | "down") => void;
  onSizeChange?: (widgetId: string, size: "small" | "medium" | "large") => void;
}

const getWidgetIcon = (widgetId: string) => {
  const icons: Record<string, any> = {
    shopify: ShoppingBag,
    team: Users,
    events: Calendar,
    emails: Mail,
    status: BarChart3,
    revenue: DollarSign,
    "calendar-connection": Link2,
    "recent-jobs": Briefcase,
  };
  return icons[widgetId] || BarChart3;
};

const getSizeIcon = (size: string) => {
  switch (size) {
    case "small": return Minimize2;
    case "medium": return Square;
    case "large": return Maximize2;
    default: return Square;
  }
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    analytics: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    communication: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    finance: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    integrations: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  };
  return colors[category] || colors.analytics;
};

export const DashboardWidgetCustomizer = ({
  open,
  onOpenChange,
  widgets,
  onToggle,
  onReorder,
  onSizeChange,
}: DashboardWidgetCustomizerProps) => {
  const [filter, setFilter] = useState<string>("all");

  const filteredWidgets = filter === "all" 
    ? widgets 
    : widgets.filter(w => w.category === filter);

  const enabledCount = widgets.filter(w => w.enabled).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Customize Dashboard Widgets
          </DialogTitle>
          <DialogDescription>
            Show, hide, and reorder widgets to personalize your dashboard experience.
            {enabledCount > 0 && (
              <span className="ml-2 text-primary font-medium">
                {enabledCount} of {widgets.length} widgets enabled
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="h-8"
          >
            All Widgets
          </Button>
          <Button
            size="sm"
            variant={filter === "analytics" ? "default" : "outline"}
            onClick={() => setFilter("analytics")}
            className="h-8"
          >
            Analytics
          </Button>
          <Button
            size="sm"
            variant={filter === "communication" ? "default" : "outline"}
            onClick={() => setFilter("communication")}
            className="h-8"
          >
            Communication
          </Button>
          <Button
            size="sm"
            variant={filter === "finance" ? "default" : "outline"}
            onClick={() => setFilter("finance")}
            className="h-8"
          >
            Finance
          </Button>
          <Button
            size="sm"
            variant={filter === "integrations" ? "default" : "outline"}
            onClick={() => setFilter("integrations")}
            className="h-8"
          >
            Integrations
          </Button>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {filteredWidgets.map((widget, index) => {
              const Icon = getWidgetIcon(widget.id);
              const isFirst = index === 0;
              const isLast = index === widgets.length - 1;

              return (
                <div
                  key={widget.id}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border transition-all",
                    widget.enabled
                      ? "bg-background border-border hover:border-primary/40"
                      : "bg-muted/30 border-muted"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                      widget.enabled ? "bg-primary/10" : "bg-muted"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        widget.enabled ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={cn(
                          "font-semibold text-sm truncate",
                          widget.enabled ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {widget.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn("text-xs capitalize", getCategoryColor(widget.category))}
                      >
                        {widget.category}
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        "text-xs truncate",
                        widget.enabled ? "text-muted-foreground" : "text-muted-foreground/70"
                      )}
                    >
                      {widget.description}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Size selector */}
                    {onSizeChange && (
                      <div className="flex items-center gap-1 mr-2">
                        {(["small", "medium", "large"] as const).map((size) => {
                          const SizeIcon = getSizeIcon(size);
                          return (
                            <Button
                              key={size}
                              variant={widget.size === size ? "default" : "ghost"}
                              size="sm"
                              onClick={() => onSizeChange(widget.id, size)}
                              className="h-8 w-8 p-0"
                              title={`${size.charAt(0).toUpperCase() + size.slice(1)} size`}
                            >
                              <SizeIcon className="h-3.5 w-3.5" />
                            </Button>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0"
                        onClick={() => onReorder(widget.id, "up")}
                        disabled={isFirst}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0"
                        onClick={() => onReorder(widget.id, "down")}
                        disabled={isLast}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Toggle switch */}
                    <Switch
                      checked={widget.enabled}
                      onCheckedChange={() => onToggle(widget.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
