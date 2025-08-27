
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Calculator, Calendar, Package } from "lucide-react";

interface QuickActionsProps {
  onNewJob: () => void;
  onNewClient: () => void;
  onCalculator: () => void;
  onCalendar: () => void;
  onInventory: () => void;
}

export const QuickActions = ({ onNewJob, onNewClient, onCalculator, onCalendar, onInventory }: QuickActionsProps) => {
  const actions = [
    { label: "New Project", icon: Plus, onClick: onNewJob, variant: "brand" as const },
    { label: "Add Client", icon: Users, onClick: onNewClient, variant: "success" as const },
    { label: "Calculator", icon: Calculator, onClick: onCalculator, variant: "default" as const },
    { label: "Calendar", icon: Calendar, onClick: onCalendar, variant: "warning" as const },
    { label: "Inventory", icon: Package, onClick: onInventory, variant: "secondary" as const },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                onClick={action.onClick}
                variant={action.variant}
                size="default"
                className="flex items-center gap-2 py-3 h-auto"
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
