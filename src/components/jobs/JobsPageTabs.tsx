
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JobsPageTabsProps {
  activeTab: "jobs" | "clients" | "emails" | "analytics";
  setActiveTab: (tab: "jobs" | "clients" | "emails" | "analytics") => void;
  jobsCount: number;
  clientsCount: number;
  emailsCount: number;
}

export const JobsPageTabs = ({
  activeTab,
  setActiveTab,
  jobsCount,
  clientsCount,
  emailsCount
}: JobsPageTabsProps) => {
  const tabs = [
    { id: "jobs" as const, label: "Jobs", count: jobsCount },
    { id: "clients" as const, label: "Clients", count: clientsCount },
    { id: "emails" as const, label: "Emails", count: emailsCount },
    { id: "analytics" as const, label: "Analytics", count: 0 }
  ];

  return (
    <div className="flex space-x-1 border-b border-company-secondary/30 glass-morphism">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 rounded-none transition-all duration-300 ${
            activeTab === tab.id
              ? "border-company-primary text-company-primary bg-company-primary/10 ai-shimmer"
              : "border-transparent text-company-secondary hover:text-company-primary hover:border-company-secondary"
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="font-medium">{tab.label}</span>
          {tab.count > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 bg-company-secondary/20 text-company-primary text-xs px-2 py-1"
            >
              {tab.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};
