
import { User, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientSelectionPromptProps {
  onSearchClients: () => void;
  onCreateClient: () => void;
}

export const ClientSelectionPrompt = ({ onSearchClients, onCreateClient }: ClientSelectionPromptProps) => {
  return (
    <div className="text-center py-12">
      <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold mb-4">No Client Selected</h3>
      <p className="text-muted-foreground mb-6">Select an existing client or create a new one for this project</p>
      <div className="flex justify-center space-x-3">
        <Button onClick={onSearchClients} variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Search Clients
        </Button>
        <Button onClick={onCreateClient}>
          <Plus className="h-4 w-4 mr-2" />
          Create Client
        </Button>
      </div>
    </div>
  );
};
