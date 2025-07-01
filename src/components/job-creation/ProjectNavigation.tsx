
import { Button } from "@/components/ui/button";
import { User, Briefcase, FileText, Wrench } from "lucide-react";

interface ProjectNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  project?: any;
  client?: any;
}

export const ProjectNavigation = ({ activeTab, onTabChange, project, client }: ProjectNavigationProps) => {
  const navItems = [
    { id: "client", label: "Client", icon: User },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "quote", label: "Quote", icon: FileText },
    { id: "workshop", label: "Workshop", icon: Wrench },
  ];

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

  return (
    <div className="flex space-x-0 px-6">
      {navItems.map((item) => {
        const Icon = item.icon;
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
            <span>{item.label}</span>
            {item.id === "client" && getClientIndicator()}
          </Button>
        );
      })}
    </div>
  );
};
