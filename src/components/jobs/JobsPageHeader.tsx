
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface JobsPageHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projectsCount: number;
  clientsCount: number;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onNewJob: () => void;
}

export const JobsPageHeader = ({
  activeTab,
  setActiveTab,
  projectsCount,
  clientsCount,
  showFilters,
  setShowFilters,
  onNewJob
}: JobsPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant={activeTab === "jobs" ? "default" : "outline"}
          onClick={() => setActiveTab("jobs")}
          className="px-6"
        >
          Jobs ({projectsCount})
        </Button>
        <Button
          variant={activeTab === "client" ? "default" : "outline"} 
          onClick={() => setActiveTab("client")}
          className="px-6"
        >
          Client ({clientsCount})
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          className="bg-slate-600 hover:bg-slate-700 text-white"
          onClick={onNewJob}
        >
          New Job
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="bg-slate-600 hover:bg-slate-700 text-white"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
