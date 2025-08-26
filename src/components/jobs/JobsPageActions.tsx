
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
    <div className="flex items-center gap-3">
      {activeTab === "clients" && (
        <Button 
          variant="brand"
          size="default"
          onClick={onNewClient}
        >
          New Client
        </Button>
      )}
      
      {activeTab === "emails" && (
        <>
          <Button 
            variant="outline"
            size="default"
            onClick={() => setShowEmailFilters?.(!showEmailFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button 
            variant="brand"
            size="default"
            onClick={onNewEmail}
          >
            New Email
          </Button>
        </>
      )}
      
      {activeTab === "jobs" && (
        <Button 
          variant="outline"
          size="default"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      )}
    </div>
  );
};
