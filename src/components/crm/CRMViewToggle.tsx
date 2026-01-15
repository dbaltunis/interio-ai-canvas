import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, Table2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export type CRMViewMode = 'board' | 'list' | 'table' | 'my-day';

interface CRMViewToggleProps {
  value: CRMViewMode;
  onChange: (view: CRMViewMode) => void;
  className?: string;
}

export const CRMViewToggle = ({ value, onChange, className }: CRMViewToggleProps) => {
  const views = [
    { id: 'my-day' as const, icon: CalendarDays, label: 'My Day' },
    { id: 'board' as const, icon: LayoutGrid, label: 'Board' },
    { id: 'list' as const, icon: List, label: 'List' },
    { id: 'table' as const, icon: Table2, label: 'Table' },
  ];

  return (
    <div className={cn("flex items-center gap-1 p-1 rounded-lg bg-muted/50", className)}>
      {views.map((view) => (
        <Button
          key={view.id}
          variant={value === view.id ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onChange(view.id)}
          className={cn(
            "h-8 gap-1.5 text-xs",
            value === view.id && "bg-background shadow-sm"
          )}
        >
          <view.icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{view.label}</span>
        </Button>
      ))}
    </div>
  );
};
