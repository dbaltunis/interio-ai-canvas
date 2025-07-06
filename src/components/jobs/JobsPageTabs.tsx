
import { Button } from "@/components/ui/button";

interface JobsPageTabsProps {
  activeTab: "jobs" | "clients" | "emails";
  setActiveTab: (tab: "jobs" | "clients" | "emails") => void;
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
  return (
    <div className="flex items-center space-x-0">
      <Button
        variant={activeTab === "emails" ? "default" : "ghost"}
        className={`rounded-r-none px-6 py-2 transition-all duration-200 ${
          activeTab === "emails" 
            ? "bg-brand-primary text-white border border-brand-primary hover:bg-brand-accent" 
            : "bg-card text-brand-neutral border border-border hover:bg-brand-secondary/10"
        }`}
        onClick={() => setActiveTab("emails")}
      >
        📧 Emails ({emailsCount})
      </Button>
      <Button
        variant={activeTab === "jobs" ? "default" : "ghost"}
        className={`rounded-none border-l-0 px-6 py-2 transition-all duration-200 ${
          activeTab === "jobs" 
            ? "bg-brand-primary text-white border border-brand-primary hover:bg-brand-accent" 
            : "bg-card text-brand-neutral border border-border hover:bg-brand-secondary/10"
        }`}
        onClick={() => setActiveTab("jobs")}
      >
        📋 Jobs ({jobsCount})
      </Button>
      <Button
        variant={activeTab === "clients" ? "default" : "ghost"}
        className={`rounded-l-none border-l-0 px-6 py-2 transition-all duration-200 ${
          activeTab === "clients" 
            ? "bg-brand-primary text-white border border-brand-primary hover:bg-brand-accent" 
            : "bg-card text-brand-neutral border border-border hover:bg-brand-secondary/10"
        }`}
        onClick={() => setActiveTab("clients")}
      >
        👥 Clients ({clientsCount})
      </Button>
    </div>
  );
};
