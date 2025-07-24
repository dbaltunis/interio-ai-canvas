
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { useClient } from "@/hooks/useClients";
import { ClientDetails } from './ClientDetails';
import { ClientProjects } from './ClientProjects';
import { ClientMeasurements } from './ClientMeasurements';
import { QuickMeasurementAccess } from "./QuickMeasurementAccess";
import { useMeasurements } from '@/hooks/useMeasurements';

interface ClientProfilePageProps {
  clientId: string;
}

export const ClientProfilePage = ({ clientId }: ClientProfilePageProps) => {
  const { data: client, isLoading } = useClient(clientId);
  const { data: measurements } = useMeasurements(clientId);

  if (isLoading) {
    return <div className="p-6">Loading client details...</div>;
  }

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">{client.name}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ClientDetails client={client} />
          <ClientProjects clientId={clientId} />
          <ClientMeasurements clientId={clientId} />
        </div>
        
        <div className="space-y-6">
          <QuickMeasurementAccess 
            client={client}
          />
        </div>
      </div>
    </div>
  );
};
