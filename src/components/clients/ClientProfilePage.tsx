
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, MapPin, Building2, User, Edit, Calendar, FileText, FolderOpen, Activity } from "lucide-react";
import { useClient } from "@/hooks/useClients";
import { useClientJobs } from "@/hooks/useClientJobs";
import { ClientEmailHistory } from "./ClientEmailHistory";
import { ClientActivityTimeline } from "./ClientActivityTimeline";
import { ClientProjectsList } from "./ClientProjectsList";
import { ClientQuotesList } from "./ClientQuotesList";
import { QuickMeasurementAccess } from "./QuickMeasurementAccess";
import { ClientQuickActions } from "./ClientQuickActions";
import { EmailComposer } from "../jobs/email/EmailComposer";

interface ClientProfilePageProps {
  clientId: string;
  onBack: () => void;
  onEdit: () => void;
}

export const ClientProfilePage = ({ clientId, onBack, onEdit }: ClientProfilePageProps) => {
  const { data: client, isLoading: clientLoading } = useClient(clientId);
  const { data: projects } = useClientJobs(clientId);
  const [showEmailComposer, setShowEmailComposer] = useState(false);

  if (clientLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600">Loading client profile...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Client not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    return type === "B2B" 
      ? "bg-blue-100 text-blue-800 border-blue-200" 
      : "bg-secondary text-secondary-foreground border-secondary";
  };

  const getTypeIcon = (type: string) => {
    return type === "B2B" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const clientDisplayName = client.client_type === 'B2B' ? client.company_name : client.name;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CRM
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">
              {clientDisplayName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${getTypeColor(client.client_type || 'B2C')} border flex items-center space-x-1`} variant="secondary">
                {getTypeIcon(client.client_type || 'B2C')}
                <span>{client.client_type || 'B2C'}</span>
              </Badge>
              {client.client_type === 'B2B' && client.contact_person && (
                <span className="text-gray-600">Contact: {client.contact_person}</span>
              )}
            </div>
          </div>
        </div>
        
        <Button onClick={onEdit} className="bg-brand-primary hover:bg-brand-accent text-white">
          <Edit className="h-4 w-4 mr-2" />
          Edit Client
        </Button>
      </div>

      {/* Client Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-brand-primary">{projects?.length || 0}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-brand-primary opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-green-600">$0</p>
              </div>
              <FileText className="h-8 w-8 text-green-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Contact</p>
                <p className="text-2xl font-bold text-blue-600">--</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-bold text-yellow-600">Active</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-600 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <ClientQuickActions 
        client={{
          id: client.id,
          name: clientDisplayName || '',
          email: client.email,
          phone: client.phone,
        }}
      />

      {/* Client Details and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{client.email || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{client.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <div className="font-medium">
                        {client.address && (
                          <p>{client.address}</p>
                        )}
                        {(client.city || client.state) && (
                          <p>{client.city && client.state ? `${client.city}, ${client.state}` : client.city || client.state}</p>
                        )}
                        {client.zip_code && (
                          <p>{client.zip_code}</p>
                        )}
                        {!client.address && !client.city && !client.state && !client.zip_code && (
                          <p>Not provided</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {client.notes && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <p className="text-gray-700">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Measurement Access */}
        <div>
          <QuickMeasurementAccess 
            clientId={clientId} 
            clientName={clientDisplayName || 'Unknown Client'} 
          />
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="emails">Email History</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4">
          <ClientActivityTimeline clientId={clientId} />
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          <ClientProjectsList clientId={clientId} />
        </TabsContent>
        
        <TabsContent value="emails" className="space-y-4">
          <ClientEmailHistory 
            clientId={clientId} 
            clientEmail={client.email}
            onComposeEmail={() => setShowEmailComposer(true)}
          />
        </TabsContent>
        
        <TabsContent value="quotes" className="space-y-4">
          <ClientQuotesList clientId={clientId} />
        </TabsContent>
      </Tabs>

      {/* Email Composer Dialog */}
      {showEmailComposer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto m-4">
            <EmailComposer 
              clientId={clientId}
              onClose={() => setShowEmailComposer(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
