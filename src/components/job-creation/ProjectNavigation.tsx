
import { Button } from "@/components/ui/button";
import { User, Briefcase, FileText, Wrench } from "lucide-react";
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
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "quote", label: "Quote", icon: FileText },
    { id: "workshop", label: "Workshop", icon: Wrench },
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
    <div className="flex space-x-0 px-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const displayLabel = item.id === "client" ? getClientLabel() : item.label;
        
        return (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => onTabChange(item.id)}
            className={`px-6 py-2 rounded-none border-b-2 ${
              activeTab === item.id
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            <span>{displayLabel}</span>
            {item.id === "client" && getClientIndicator()}
          </Button>
        );
      })}
    </div>
  );
};
