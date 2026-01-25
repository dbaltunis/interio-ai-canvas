import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Calculator, Calendar, Package } from "lucide-react";
import { useHasPermission } from "@/hooks/usePermissions";

interface QuickActionsProps {
  onNewJob: () => void;
  onNewClient: () => void;
  onCalculator: () => void;
  onCalendar: () => void;
  onInventory: () => void;
}

export const QuickActions = ({ onNewJob, onNewClient, onCalculator, onCalendar, onInventory }: QuickActionsProps) => {
  // Permission checks
  const canCreateJobs = useHasPermission('create_jobs');
  const canViewCalendar = useHasPermission('view_calendar');
  const canViewOwnCalendar = useHasPermission('view_own_calendar');
  const canViewInventory = useHasPermission('view_inventory');
  
  // Combined calendar permission
  const canAccessCalendar = canViewCalendar !== false || canViewOwnCalendar !== false;

  // Build actions array based on permissions
  const actions = [
    canCreateJobs !== false && { label: "New Project", icon: Plus, onClick: onNewJob, variant: "brand" as const },
    { label: "Add Client", icon: Users, onClick: onNewClient, variant: "success" as const },
    { label: "Calculator", icon: Calculator, onClick: onCalculator, variant: "default" as const },
    canAccessCalendar && { label: "Calendar", icon: Calendar, onClick: onCalendar, variant: "warning" as const },
    canViewInventory !== false && { label: "Inventory", icon: Package, onClick: onInventory, variant: "secondary" as const },
  ].filter(Boolean) as Array<{ label: string; icon: typeof Plus; onClick: () => void; variant: "brand" | "success" | "default" | "warning" | "secondary" }>;

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
