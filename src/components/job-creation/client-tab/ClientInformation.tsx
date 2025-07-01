
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClientInformationProps {
  client: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    notes?: string;
  };
}

export const ClientInformation = ({ client }: ClientInformationProps) => {
  return (
    <div className="space-y-4">
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
