
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Mail, Phone, MapPin, Building2, User, Edit, Calendar, FileText, DollarSign, Star, TrendingUp, Clock, AlertCircle, Target, Percent } from "lucide-react";
import { useClient, useUpdateClient } from "@/hooks/useClients";
import { useClientJobs } from "@/hooks/useClientJobs";
import { ClientEmailHistory } from "./ClientEmailHistory";
import { ClientProjectsList } from "./ClientProjectsList";
import { MeasurementsList } from "../measurements/MeasurementsList";
import { EmailComposer } from "../jobs/email/EmailComposer";
import { ClientFormWithLeadIntelligence } from "./ClientFormWithLeadIntelligence";

interface ClientProfilePageProps {
  clientId: string;
  onBack: () => void;
  onEdit: () => void;
  onTabChange?: (tab: string) => void;
}

export const ClientProfilePage = ({ clientId, onBack, onEdit, onTabChange }: ClientProfilePageProps) => {
  const { data: client, isLoading: clientLoading } = useClient(clientId);
  const { data: projects } = useClientJobs(clientId);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  if (clientLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading client profile...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Client not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    return type === "B2B"
      ? "bg-primary/10 text-primary border-primary/20"
      : "bg-secondary text-secondary-foreground border-secondary";
  };

  const getTypeIcon = (type: string) => {
    return type === "B2B" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const clientDisplayName = client.client_type === 'B2B' ? client.company_name : client.name;

  // Calculate total project value from completed projects - temporarily disable until proper cost tracking
  const totalProjectValue = client.deal_value || 0;

  const getStageColor = (stage: string) => {
    const colors = {
      'lead': 'bg-gray-100 text-gray-800',
      'qualification': 'bg-blue-100 text-blue-800',
      'proposal': 'bg-yellow-100 text-yellow-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'closed_won': 'bg-green-100 text-green-800',
      'closed_lost': 'bg-red-100 text-red-800'
    };
    return colors[stage as keyof typeof colors] || colors.lead;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-blue-100 text-blue-600',
      'high': 'bg-orange-100 text-orange-600',
      'urgent': 'bg-red-100 text-red-600'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPriorityIcon = (priority: string) => {
    const icons = {
      'low': <TrendingUp className="h-3 w-3" />,
      'medium': <Target className="h-3 w-3" />,
      'high': <AlertCircle className="h-3 w-3" />,
      'urgent': <AlertCircle className="h-3 w-3" />
    };
    return icons[priority as keyof typeof icons] || icons.medium;
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-gray-600';
  };

  const isHotLead = (score: number) => score >= 70;

  return (
    <div className="liquid-glass rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className=""
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CRM
          </Button>
          <div className="flex items-center gap-2">
            {(client.lead_score && isHotLead(client.lead_score)) && (
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            )}
            <h1 className="text-3xl font-bold text-brand-primary">
              {clientDisplayName}
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={`${getTypeColor(client.client_type || 'B2C')} border flex items-center space-x-1`} variant="secondary">
              {getTypeIcon(client.client_type || 'B2C')}
              <span>{client.client_type || 'B2C'}</span>
            </Badge>
            
            <Badge className={`${getStageColor(client.funnel_stage || 'lead')} border-0 text-xs`} variant="outline">
              {(client.funnel_stage || 'lead').replace('_', ' ').toUpperCase()}
            </Badge>
            
            <Badge className={`${getPriorityColor(client.priority_level || 'medium')} border-0 flex items-center gap-1 text-xs`} variant="outline">
              {getPriorityIcon(client.priority_level || 'medium')}
              <span>{(client.priority_level || 'medium').toUpperCase()}</span>
            </Badge>
            
            {client.client_type === 'B2B' && client.contact_person && (
              <span className="text-muted-foreground">Contact: {client.contact_person}</span>
            )}
          </div>
          {client.lead_source && (
            <div className="text-sm text-muted-foreground mt-1">
              Lead Source: {client.lead_source}
            </div>
          )}
        </div>
        
        <Button onClick={() => setShowEditDialog(true)} variant="brand">
          <Edit className="h-4 w-4 mr-2" />
          Edit Client
        </Button>
      </div>

      {/* Client Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lead Score</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${getLeadScoreColor(client.lead_score || 0)}`}>
                    {client.lead_score || 0}
                  </p>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${Math.min((client.lead_score || 0), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deal Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalProjectValue.toLocaleString()}
                </p>
                {client.conversion_probability && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    {client.conversion_probability}% probability
                  </p>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold text-brand-primary">{projects?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-brand-primary opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Contact</p>
                <p className="text-2xl font-bold text-primary">
                  {client.last_contact_date 
                    ? new Date(client.last_contact_date).toLocaleDateString()
                    : '--'
                  }
                </p>
                {client.follow_up_date && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Follow-up: {new Date(client.follow_up_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Mail className="h-8 w-8 text-primary opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Client Since</p>
                <p className="text-2xl font-bold text-secondary">
                  {new Date(client.created_at).toLocaleDateString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-secondary opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Details */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{client.email || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{client.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
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
              <p className="text-foreground">{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="measurements" className="space-y-6">
        <TabsList className="bg-background border-b border-border/50 rounded-none p-0 h-auto flex w-full justify-start gap-0">
          <TabsTrigger value="measurements" className="flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50">Measurements</TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50">Projects & Jobs</TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground hover:border-border/50">Email History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="measurements" className="space-y-4">
          <MeasurementsList 
            clientId={clientId}
            onViewMeasurement={(measurement) => console.log('View measurement:', measurement)}
            onEditMeasurement={(measurement) => console.log('Edit measurement:', measurement)}
          />
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          <ClientProjectsList clientId={clientId} onTabChange={onTabChange} />
        </TabsContent>
        
        <TabsContent value="emails" className="space-y-4">
          <ClientEmailHistory 
            clientId={clientId} 
            clientEmail={client.email}
            onComposeEmail={() => setShowEmailComposer(true)}
          />
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

      {/* Edit Client Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <ClientFormWithLeadIntelligence 
            editingClient={client}
            onCancel={() => setShowEditDialog(false)}
            onSuccess={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
