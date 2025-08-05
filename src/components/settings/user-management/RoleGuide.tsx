import { Badge } from "@/components/ui/badge";
import { Settings, Users, Shield, Eye } from "lucide-react";

export const RoleGuide = () => {
  return (
    <div className="border-t pt-6">
      <h4 className="font-medium mb-4">Role Guide</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <Badge variant="default">Owner</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Full system access including user management and all settings
          </p>
        </div>
        <div className="space-y-2 p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <Badge variant="secondary">Admin</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Most permissions except sensitive business settings
          </p>
        </div>
        <div className="space-y-2 p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <Badge variant="outline">Manager</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Day-to-day operations, inventory, and client management
          </p>
        </div>
        <div className="space-y-2 p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <Badge variant="secondary">Staff</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Basic operations like viewing and creating jobs/clients
          </p>
        </div>
      </div>
    </div>
  );
};