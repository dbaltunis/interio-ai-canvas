
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
    { label: "New Quote", icon: Plus, onClick: onNewJob, color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Add Client", icon: Users, onClick: onNewClient, color: "bg-green-600 hover:bg-green-700" },
    { label: "Calculator", icon: Calculator, onClick: onCalculator, color: "bg-purple-600 hover:bg-purple-700" },
    { label: "Calendar", icon: Calendar, onClick: onCalendar, color: "bg-orange-600 hover:bg-orange-700" },
    { label: "Inventory", icon: Package, onClick: onInventory, color: "bg-indigo-600 hover:bg-indigo-700" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                onClick={action.onClick}
                className={`${action.color} text-white flex items-center gap-2 py-3`}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
