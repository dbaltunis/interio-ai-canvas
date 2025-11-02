import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Users, Calendar, Package, TrendingUp } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

interface WelcomeStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  completed?: boolean;
}

export const RoleBasedWelcome = () => {
  const { data: userRole } = useUserRole();

  if (!userRole) return null;

  const getStepsForRole = (): WelcomeStep[] => {
    const { isOwner, isAdmin, isManager } = userRole;

    if (isOwner) {
      return [
        {
          title: "Set Up Your Business",
          description: "Configure company details, currency, and measurement units",
          icon: <TrendingUp className="h-5 w-5" />,
        },
        {
          title: "Invite Your Team",
          description: "Add team members and assign roles",
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Configure Integrations",
          description: "Connect Google Calendar, Shopify, and other services",
          icon: <Package className="h-5 w-5" />,
        },
        {
          title: "Create Product Templates",
          description: "Set up your curtain, blind, and shutter templates",
          icon: <CheckCircle2 className="h-5 w-5" />,
        },
      ];
    }

    if (isAdmin || isManager) {
      return [
        {
          title: "Manage Jobs & Quotes",
          description: "Create and track customer jobs and quotes",
          icon: <TrendingUp className="h-5 w-5" />,
        },
        {
          title: "Handle Client Relationships",
          description: "Add clients, schedule appointments, and follow up",
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "View Analytics",
          description: "Monitor business performance and team productivity",
          icon: <CheckCircle2 className="h-5 w-5" />,
        },
        {
          title: "Manage Inventory",
          description: "Track materials and create purchase orders",
          icon: <Package className="h-5 w-5" />,
        },
      ];
    }

    // Staff role
    return [
      {
        title: "Create Jobs",
        description: "Add new jobs and update their progress",
        icon: <TrendingUp className="h-5 w-5" />,
      },
      {
        title: "Manage Clients",
        description: "Add new clients and update contact details",
        icon: <Users className="h-5 w-5" />,
      },
      {
        title: "Schedule Appointments",
        description: "Book and manage customer appointments",
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        title: "View Inventory",
        description: "Check material availability",
        icon: <Package className="h-5 w-5" />,
      },
    ];
  };

  const steps = getStepsForRole();

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-blue-900 dark:text-blue-100">
            Welcome to Your Account
          </CardTitle>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-100">
            {userRole.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
          {userRole.isOwner
            ? "You're the account owner. Here's how to get started:"
            : `You've been added as ${userRole.role}. Here's what you can do:`}
        </p>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900"
            >
              <div className="mt-0.5 text-blue-600 dark:text-blue-400">{step.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {step.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};