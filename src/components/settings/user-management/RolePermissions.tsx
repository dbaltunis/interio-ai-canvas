import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Settings, FileText, BarChart3 } from "lucide-react";

const permissions = [
  {
    role: "Admin",
    color: "default" as const,
    icon: Shield,
    description: "Full system access and control",
    permissions: [
      { name: "Manage Users", level: "Full Access", variant: "default" as const },
      { name: "Business Settings", level: "Full Access", variant: "default" as const },
      { name: "View Reports", level: "Full Access", variant: "default" as const },
      { name: "Manage Projects", level: "Full Access", variant: "default" as const },
      { name: "Financial Data", level: "Full Access", variant: "default" as const },
    ]
  },
  {
    role: "Manager",
    color: "secondary" as const,
    icon: Users,
    description: "Project management and team oversight",
    permissions: [
      { name: "Manage Projects", level: "Full Access", variant: "default" as const },
      { name: "View Reports", level: "Read Only", variant: "outline" as const },
      { name: "Team Management", level: "Limited", variant: "outline" as const },
      { name: "Business Settings", level: "No Access", variant: "destructive" as const },
      { name: "Financial Data", level: "Read Only", variant: "outline" as const },
    ]
  },
  {
    role: "Staff",
    color: "outline" as const,
    icon: FileText,
    description: "Task execution and project updates",
    permissions: [
      { name: "View Projects", level: "Read Only", variant: "outline" as const },
      { name: "Update Tasks", level: "Full Access", variant: "default" as const },
      { name: "Time Tracking", level: "Full Access", variant: "default" as const },
      { name: "View Reports", level: "No Access", variant: "destructive" as const },
      { name: "Financial Data", level: "No Access", variant: "destructive" as const },
    ]
  }
];

export const RolePermissions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Permissions
        </CardTitle>
        <CardDescription>
          Access levels and capabilities for each user role
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {permissions.map((roleData) => {
            const IconComponent = roleData.icon;
            return (
              <div key={roleData.role} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <IconComponent className="h-4 w-4" />
                  <h4 className="font-semibold">{roleData.role}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{roleData.description}</p>
                <div className="space-y-3">
                  {roleData.permissions.map((permission) => (
                    <div key={permission.name} className="flex items-center justify-between">
                      <span className="text-sm">{permission.name}</span>
                      <Badge variant={permission.variant} className="text-xs">
                        {permission.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};