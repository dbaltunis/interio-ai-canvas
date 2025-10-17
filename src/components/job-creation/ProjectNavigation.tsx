
import { Button } from "@/components/ui/button";
import { User, Box, FileText, Wrench, Mail, Calendar } from "lucide-react";
import { useEffect } from "react";

interface ProjectNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  project?: any;
  client?: any;
  shouldRedirectToQuote?: boolean;
}

export const ProjectNavigation = ({ 
  activeTab, 
  onTabChange, 
  project, 
  client,
  shouldRedirectToQuote = false 
}: ProjectNavigationProps) => {
  const navItems = [
    { id: "client", label: "Client", icon: User },
    { id: "jobs", label: "Rooms & Treatments", icon: Box },
    { id: "quote", label: "Quotation", icon: FileText },
    { id: "workshop", label: "Workroom", icon: Wrench },
    { id: "emails", label: "Emails", icon: Mail },
    { id: "calendar", label: "Calendar", icon: Calendar },
  ];

  // Handle automatic redirect to quote tab when status changes to "Quote"
  useEffect(() => {
    if (shouldRedirectToQuote && activeTab !== "quote") {
      console.log('Redirecting to quote tab due to status change');
      onTabChange("quote");
    }
  }, [shouldRedirectToQuote, activeTab, onTabChange]);

  const getClientIndicator = () => {
    if (client) {
      return (
        <div className="flex items-center ml-2">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          <span className="text-xs font-medium text-green-700">
            {client.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'CL'}
          </span>
        </div>
      );
    }
    return <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>;
  };

  const getClientLabel = () => {
    if (client && client.name) {
      // Show first name only, or full name if it's short
      const firstName = client.name.split(' ')[0];
      return firstName.length > 8 ? firstName.slice(0, 8) + '...' : firstName;
    }
    return "Client";
  };

  return (
    <div className="w-full px-4 animate-fade-in">
      <div className="bg-background border-b border-border/50">
        <div className="flex w-full justify-start gap-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const displayLabel = item.id === "client" ? getClientLabel() : item.label;
            const isActive = activeTab === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 rounded-none ${
                  isActive
                    ? "border-primary text-foreground bg-primary/5 font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/50"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{displayLabel}</span>
                {item.id === "client" && getClientIndicator()}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
