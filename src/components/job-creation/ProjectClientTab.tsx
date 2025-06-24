
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClients } from "@/hooks/useClients";
import { ClientManagementPage } from "./ClientManagementPage";

interface ProjectClientTabProps {
  project: any;
}

export const ProjectClientTab = ({ project }: ProjectClientTabProps) => {
  const [showClientManagement, setShowClientManagement] = useState(false);
  const { data: clients } = useClients();
  const client = clients?.find(c => c.id === project.client_id);

  const handleClientSelect = (clientId: string) => {
    // Update project with selected client
    console.log("Selected client:", clientId);
    setShowClientManagement(false);
  };

  if (showClientManagement) {
    return (
      <ClientManagementPage 
        onBack={() => setShowClientManagement(false)}
        onClientSelect={handleClientSelect}
      />
    );
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-4">No Client Selected</h3>
          <p className="text-muted-foreground mb-6">Select an existing client or create a new one for this project</p>
          <Button onClick={() => setShowClientManagement(true)}>
            Manage Clients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Client Information</h3>
        <Button variant="outline" onClick={() => setShowClientManagement(true)}>
          Change Client
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{client.name}</span>
            <Badge variant="outline">Active Client</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Phone</h4>
              <p>{client.phone || 'Not provided'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Email</h4>
              <p>{client.email || 'Not provided'}</p>
            </div>
          </div>
          
          {client.address && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Address</h4>
              <p>{client.address}</p>
              {(client.city || client.state || client.zip_code) && (
                <p>{client.city}{client.state && `, ${client.state}`} {client.zip_code}</p>
              )}
            </div>
          )}
          
          {client.notes && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Notes</h4>
              <p>{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
