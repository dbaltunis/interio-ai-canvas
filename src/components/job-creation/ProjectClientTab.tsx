
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClients } from "@/hooks/useClients";
import { ClientManagementPage } from "./ClientManagementPage";
import { CheckCircle, User } from "lucide-react";

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
        {/* Client Status Header */}
        <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div>
              <h3 className="font-medium text-orange-800">No Client Selected</h3>
              <p className="text-sm text-orange-600">Please select or create a client for this project</p>
            </div>
          </div>
          <Button onClick={() => setShowClientManagement(true)} className="bg-orange-600 hover:bg-orange-700">
            Select Client
          </Button>
        </div>

        <div className="text-center py-12">
          <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
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
      {/* Client Status Header - Green when selected */}
      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-medium text-green-800">Client Selected</h3>
            <p className="text-sm text-green-600">
              <span className="font-medium">{client.name}</span>
              {client.client_type === 'B2B' && client.company_name && (
                <span> - {client.company_name}</span>
              )}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowClientManagement(true)}>
          Change Client
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Client Information</h3>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{client.name}</span>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active Client
            </Badge>
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
