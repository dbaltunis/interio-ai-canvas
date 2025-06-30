
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface JobsPageActionsProps {
  activeTab: "jobs" | "clients" | "emails";
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onNewJob: () => void;
  onNewClient: () => void;
}

export const JobsPageActions = ({
  activeTab,
  showFilters,
  setShowFilters,
  onNewJob,
  onNewClient
}: JobsPageActionsProps) => {
  return (
    <div className="flex items-center space-x-3">
      {activeTab === "jobs" ? (
        <Button 
          className="bg-slate-600 hover:bg-slate-700 text-white px-6"
          onClick={onNewJob}
        >
          New Job
        </Button>
      ) : activeTab === "clients" ? (
        <Button 
          className="bg-slate-600 hover:bg-slate-700 text-white px-6"
          onClick={onNewClient}
        >
          New Client
        </Button>
      ) : (
        <Button 
          className="bg-slate-600 hover:bg-slate-700 text-white px-6"
        >
          New Email
        </Button>
      )}
      
      {activeTab === "jobs" && (
        <Button 
          variant="outline" 
          className="bg-slate-500 text-white hover:bg-slate-600 px-4"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
