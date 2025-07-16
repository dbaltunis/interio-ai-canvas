
import { Button } from "@/components/ui/button";

interface EmailTabsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const EmailTabsNavigation = ({ activeTab, onTabChange }: EmailTabsNavigationProps) => {
  const tabs = [
    { id: "history", label: "History" },
    { id: "campaigns", label: "Campaigns" },
    { id: "templates", label: "Templates" },
    { id: "compose", label: "Compose" }
  ];

  return (
    <div className="flex items-center space-x-0">
      {tabs.map((tab, index) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          className={`px-6 py-2 ${
            index === 0 
              ? "rounded-r-none" 
              : index === tabs.length - 1 
                ? "rounded-l-none border-l-0" 
                : "rounded-none border-l-0"
          } ${
            activeTab === tab.id 
              ? "bg-gray-100 text-gray-900 border border-gray-300" 
              : "bg-white text-gray-600 border border-gray-300"
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
};
