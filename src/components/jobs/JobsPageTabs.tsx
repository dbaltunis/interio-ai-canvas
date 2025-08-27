
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
    <div className="flex border-b border-border/50">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 rounded-none transition-all duration-200 ${
            activeTab === tab.id
              ? "border-primary text-foreground bg-primary/5 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/50"
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="text-sm">{tab.label}</span>
          {tab.count > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 text-xs"
            >
              {tab.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};
