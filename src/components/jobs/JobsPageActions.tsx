
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface JobsPageActionsProps {
  activeTab: "jobs" | "clients" | "emails";
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onNewJob: () => void;
  onNewClient: () => void;
  onNewEmail?: () => void;
  showEmailFilters?: boolean;
  setShowEmailFilters?: (show: boolean) => void;
}

export const JobsPageActions = ({
  activeTab,
  showFilters,
  setShowFilters,
  onNewJob,
  onNewClient,
  onNewEmail,
  showEmailFilters,
  setShowEmailFilters
}: JobsPageActionsProps) => {
  return (
    <div className="flex items-center space-x-3">
      {activeTab === "clients" && (
        <Button 
          className="bg-brand-primary hover:bg-brand-accent text-white px-6 font-medium"
          onClick={onNewClient}
        >
          New Client
        </Button>
      )}
      
      {activeTab === "emails" && (
        <>
          <Button 
            variant="outline" 
            className="border-gray-300 px-4"
            onClick={() => setShowEmailFilters?.(!showEmailFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button 
            className="bg-brand-primary hover:bg-brand-accent text-white px-6 font-medium"
            onClick={onNewEmail}
          >
            New Email
          </Button>
        </>
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
