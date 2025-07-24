
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Building, Edit } from "lucide-react";

interface ClientDetailsProps {
  client: any;
  onEdit?: () => void;
}

export const ClientDetails = ({ client, onEdit }: ClientDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Client Information</CardTitle>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Contact Information</h4>
            <div className="space-y-2">
              {client.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{client.address}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Business Information</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <Badge variant="outline">{client.client_type || 'B2C'}</Badge>
              </div>
              {client.company_name && (
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{client.company_name}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stage:</span>
                <Badge>{client.funnel_stage || 'lead'}</Badge>
              </div>
            </div>
          </div>
        </div>
        
        {client.notes && (
          <div>
            <h4 className="font-semibold mb-2">Notes</h4>
            <p className="text-sm text-gray-600">{client.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
