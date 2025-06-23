
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/useClients";

interface ProjectClientTabProps {
  project: any;
}

export const ProjectClientTab = ({ project }: ProjectClientTabProps) => {
  const { data: clients } = useClients();
  const client = clients?.find(c => c.id === project.client_id);

  if (!client) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Client information not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Client Information</h3>
      
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
