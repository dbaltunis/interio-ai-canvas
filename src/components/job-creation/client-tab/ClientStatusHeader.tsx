
import { CheckCircle, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientStatusHeaderProps {
  hasClient: boolean;
  clientName?: string;
  companyName?: string;
  onEditClient: () => void;
  onChangeClient: () => void;
  onRemoveClient: () => void;
}

export const ClientStatusHeader = ({
  hasClient,
  clientName,
  companyName,
  onEditClient,
  onChangeClient,
  onRemoveClient
}: ClientStatusHeaderProps) => {
  if (!hasClient) {
    return (
      <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <div>
            <h3 className="font-medium text-orange-800">No Client Selected</h3>
            <p className="text-sm text-orange-600">Please select or create a client for this project</p>
          </div>
        </div>
        <Button onClick={onChangeClient} className="bg-orange-600 hover:bg-orange-700">
          <Search className="h-4 w-4 mr-2" />
          Select Client
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <CheckCircle className="w-6 h-6 text-green-600" />
        <div>
          <h3 className="font-medium text-green-800">Client Selected</h3>
          <p className="text-sm text-green-600">
            <span className="font-medium">{clientName}</span>
            {companyName && <span> - {companyName}</span>}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={onEditClient}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Client
        </Button>
        <Button variant="outline" onClick={onChangeClient}>
          <Search className="h-4 w-4 mr-2" />
          Change Client
        </Button>
        <Button variant="outline" onClick={onRemoveClient} className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4 mr-2" />
          Remove Client
        </Button>
      </div>
    </div>
  );
};
