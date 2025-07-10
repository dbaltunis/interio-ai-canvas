
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface JobsPageActionsProps {
  activeTab: "jobs" | "clients" | "emails";
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onNewJob: () => void;
  onNewClient: () => void;
  onNewEmail?: () => void;
}

export const JobsPageActions = ({
  activeTab,
  showFilters,
  setShowFilters,
  onNewJob,
  onNewClient,
  onNewEmail
}: JobsPageActionsProps) => {
  return (
    <div className="flex items-center space-x-3">
      {activeTab === "jobs" ? (
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 font-medium"
          onClick={onNewJob}
        >
          New Job
        </Button>
      ) : activeTab === "clients" ? (
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 font-medium"
          onClick={onNewClient}
        >
          New Client
        </Button>
      ) : (
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 font-medium"
          onClick={onNewEmail}
        >
          New Email
        </Button>
      )}
      
      {activeTab === "jobs" && (
        <Button 
          variant="outline" 
          className="border-gray-300 px-4"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      )}
    </div>
  );
};
