
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
  return (
    <div className="flex items-center space-x-0">
      <Button
        variant={activeTab === "jobs" ? "default" : "ghost"}
        className={`rounded-r-none px-6 py-2 ${
          activeTab === "jobs" 
            ? "bg-gray-100 text-gray-900 border border-gray-300" 
            : "bg-white text-gray-600 border border-gray-300"
        }`}
        onClick={() => setActiveTab("jobs")}
      >
        Jobs ({jobsCount})
      </Button>
      <Button
        variant={activeTab === "clients" ? "default" : "ghost"}
        className={`rounded-none border-l-0 px-6 py-2 ${
          activeTab === "clients" 
            ? "bg-gray-100 text-gray-900 border border-gray-300" 
            : "bg-white text-gray-600 border border-gray-300"
        }`}
        onClick={() => setActiveTab("clients")}
      >
        Clients ({clientsCount})
      </Button>
      <Button
        variant={activeTab === "emails" ? "default" : "ghost"}
        className={`rounded-none border-l-0 px-6 py-2 ${
          activeTab === "emails" 
            ? "bg-gray-100 text-gray-900 border border-gray-300" 
            : "bg-white text-gray-600 border border-gray-300"
        }`}
        onClick={() => setActiveTab("emails")}
      >
        Emails ({emailsCount})
      </Button>
      <Button
        variant={activeTab === "analytics" ? "default" : "ghost"}
        className={`rounded-l-none border-l-0 px-6 py-2 ${
          activeTab === "analytics" 
            ? "bg-gray-100 text-gray-900 border border-gray-300" 
            : "bg-white text-gray-600 border border-gray-300"
        }`}
        onClick={() => setActiveTab("analytics")}
      >
        Analytics
      </Button>
    </div>
  );
};
