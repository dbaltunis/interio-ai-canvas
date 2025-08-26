
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
    { label: "New Project", icon: Plus, onClick: onNewJob, color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Add Client", icon: Users, onClick: onNewClient, color: "bg-green-600 hover:bg-green-700" },
    { label: "Calculator", icon: Calculator, onClick: onCalculator, color: "bg-primary hover:bg-primary/90" },
    { label: "Calendar", icon: Calendar, onClick: onCalendar, color: "bg-orange-600 hover:bg-orange-700" },
    { label: "Inventory", icon: Package, onClick: onInventory, color: "bg-indigo-600 hover:bg-indigo-700" },
  ];

  return (
    <Card variant="modern">
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
                className={`${action.color} text-white flex items-center gap-2 py-3 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
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
