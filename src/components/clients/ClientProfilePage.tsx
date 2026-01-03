import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ArrowLeft, Mail, Phone, MapPin, Building2, User, Edit, Calendar, 
  FileText, DollarSign, Clock, Save, X, Briefcase, Package, ChevronDown, ChevronUp, MessageCircle
} from "lucide-react";
import { ClientQuickActionsBar } from "./ClientQuickActionsBar";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { useClient, useUpdateClient } from "@/hooks/useClients";
import { useClientJobs, useClientQuotes } from "@/hooks/useClientJobs";
import { useClientFiles } from "@/hooks/useClientFiles";
import { useCanEditClient } from "@/hooks/useClientEditPermissions";
import { ClientCommunicationsTab } from "./ClientCommunicationsTab";
import { LeadSourceSelect } from "@/components/crm/LeadSourceSelect";
import { ClientProjectsList } from "./ClientProjectsList";
import { MeasurementsList } from "../measurements/MeasurementsList";
import { ClientActivityLog } from "./ClientActivityLog";
import { ClientAllNotesSection } from "./ClientAllNotesSection";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ClientFilesManager } from "./ClientFilesManager";
import { useAuth } from "@/components/auth/AuthProvider";
import { FUNNEL_STAGES, getStageByValue } from "@/constants/clientConstants";

interface ClientProfilePageProps {
  clientId: string;
  onBack: () => void;
  onEdit: () => void;
  onTabChange?: (tab: string) => void;
}

export const ClientProfilePage = ({ clientId, onBack, onTabChange }: ClientProfilePageProps) => {
  const { data: client, isLoading: clientLoading } = useClient(clientId);
  const { data: projects } = useClientJobs(clientId);
  const { data: quotes } = useClientQuotes(clientId);
  const updateClient = useUpdateClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: clientFiles } = useClientFiles(clientId, user?.id || '');
  const { formatCurrency } = useFormattedCurrency();
  const { canEditClient, isLoading: editPermissionLoading } = useCanEditClient(client);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("notes");
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Calculate portfolio value from closed/completed projects only
  const closedProjects = (projects || []).filter(p => 
    ['closed', 'completed'].includes(p.status?.toLowerCase() || '')
  );
  
  const portfolioValue = closedProjects.reduce((sum, project) => {
    const projectQuotes = (quotes || []).filter(q => q.project_id === project.id);
    if (projectQuotes.length > 0) {
      const latestQuote = projectQuotes[0];
      return sum + parseFloat(latestQuote.total_amount?.toString() || '0');
    }
    return sum;
  }, 0);

  if (clientLoading || editPermissionLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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

  const handleEdit = () => {
    setEditedClient({ ...client });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!canEditClient) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this client",
        variant: "destructive",
      });
      setIsEditing(false);
      return;
    }

    try {
      await updateClient.mutateAsync({
        id: client.id,
        ...editedClient,
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditedClient(null);
    setIsEditing(false);
  };

  const getStageColor = (stage: string) => {
    const stageData = getStageByValue(stage);
    return stageData?.color || 'bg-muted text-muted-foreground';
  };

  const currentClient = isEditing ? editedClient : client;
  const clientDisplayName = currentClient.client_type === 'B2B' 
    ? currentClient.company_name 
    : currentClient.name;

  return (
    <div className="max-h-screen overflow-y-auto bg-background p-3 sm:p-6 space-y-4 animate-fade-in">
      {/* Header Row - Avatar, Name, Stage, Compact Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {(clientDisplayName || 'U').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold truncate">{clientDisplayName}</h1>
              <Select 
                value={currentClient.funnel_stage || 'lead'}
                onValueChange={async (value) => {
                  if (!canEditClient) {
                    toast({ title: "Permission Denied", variant: "destructive" });
                    return;
                  }
                  try {
                    await updateClient.mutateAsync({ id: client.id, funnel_stage: value });
                  } catch (error) {
                    toast({ title: "Failed to update", variant: "destructive" });
                  }
                }}
                disabled={!canEditClient}
              >
                <SelectTrigger className="w-auto h-6 px-2 border-0 bg-transparent hover:bg-muted/50 p-0">
                  <Badge className={`${getStageColor(currentClient.funnel_stage || 'lead')} text-xs`}>
                    {getStageByValue(currentClient.funnel_stage || 'lead')?.label || 'Lead'}
                  </Badge>
                </SelectTrigger>
                <SelectContent>
                  {FUNNEL_STAGES.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${stage.color.split(' ')[0]}`} />
                        {stage.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Compact Stats Badges */}
        <div className="flex items-center gap-2 flex-wrap ml-[52px] sm:ml-0">
          <Badge variant="outline" className="gap-1 text-xs font-medium">
            <DollarSign className="h-3 w-3 text-green-600" />
            {formatCurrency(portfolioValue)}
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs font-medium">
            <Briefcase className="h-3 w-3 text-blue-600" />
            {projects?.length || 0} projects
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs font-medium">
            <Clock className="h-3 w-3 text-purple-600" />
            {currentClient.last_contact_date 
              ? formatDistanceToNow(new Date(currentClient.last_contact_date), { addSuffix: false })
              : 'Never'}
          </Badge>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <ClientQuickActionsBar 
        client={currentClient} 
        onEdit={() => {
          handleEdit();
          setDetailsOpen(true);
        }}
        canEditClient={canEditClient}
      />

      {/* Main Content Area - Three Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column - Client Details & Files (Collapsible) */}
        <div className="lg:col-span-3 space-y-3">
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-2.5 px-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium">Details</CardTitle>
                    <div className="flex items-center gap-1">
                      {!detailsOpen && canEditClient && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleEdit(); setDetailsOpen(true); }}
                          className="h-5 w-5"
                        >
                          <Edit className="h-2.5 w-2.5" />
                        </Button>
                      )}
                      {detailsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-3 px-3 space-y-2">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-[10px]">Priority</Label>
                        <Select 
                          value={editedClient.priority_level || 'medium'}
                          onValueChange={(value) => setEditedClient({ ...editedClient, priority_level: value })}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Lead Source</Label>
                        <LeadSourceSelect
                          value={editedClient.lead_source || 'other'}
                          onValueChange={(value) => setEditedClient({ ...editedClient, lead_source: value })}
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" onClick={handleCancel} disabled={updateClient.isPending} className="flex-1 h-6 text-[10px]">
                          <X className="h-2.5 w-2.5 mr-0.5" /> Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={updateClient.isPending} className="flex-1 h-6 text-[10px]">
                          <Save className="h-2.5 w-2.5 mr-0.5" /> Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{currentClient.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                        <span>{currentClient.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{currentClient.address || 'No address'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${
                          currentClient.priority_level === 'high' ? 'bg-red-100 text-red-700' :
                          currentClient.priority_level === 'low' ? 'bg-gray-100 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {(currentClient.priority_level || 'medium').toUpperCase()}
                        </Badge>
                      </div>
                      {canEditClient && (
                        <Button variant="outline" size="sm" onClick={handleEdit} className="w-full mt-1 h-6 text-[10px]">
                          <Edit className="h-2.5 w-2.5 mr-1" /> Edit
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Files Compact */}
          {user && (
            <Card>
              <CardHeader className="py-2.5 px-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                    <FileText className="h-3 w-3" />
                    Files
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{clientFiles?.length || 0}</Badge>
                </div>
              </CardHeader>
              <CardContent className="py-0 pb-2 px-3">
                <ClientFilesManager clientId={clientId} userId={user.id} canEditClient={canEditClient} compact />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Middle Column - Projects (Elevated) */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Projects
                </CardTitle>
                <Badge variant="secondary" className="text-xs">{projects?.length || 0}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <ClientProjectsList clientId={clientId} onTabChange={onTabChange} compact />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Communications */}
        <div className="lg:col-span-5">
          <ClientCommunicationsTab 
            clientId={clientId} 
            clientEmail={client.email}
          />
        </div>
      </div>

      {/* Secondary Content Tabs - Notes, Activity, Measurements only */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-8 w-auto bg-muted/30 p-0.5">
          <TabsTrigger value="notes" className="text-xs gap-1 px-2.5 h-7 data-[state=active]:bg-background">
            <FileText className="h-3 w-3" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1 px-2.5 h-7 data-[state=active]:bg-background">
            <Clock className="h-3 w-3" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="measurements" className="text-xs gap-1 px-2.5 h-7 data-[state=active]:bg-background">
            <Package className="h-3 w-3" />
            Measurements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-3">
          <ClientAllNotesSection clientId={clientId} canEditClient={canEditClient} />
        </TabsContent>

        <TabsContent value="activity" className="mt-3">
          <ClientActivityLog clientId={clientId} canEditClient={canEditClient} />
        </TabsContent>

        <TabsContent value="measurements" className="mt-3">
          <MeasurementsList 
            clientId={clientId}
            onViewMeasurement={() => {}}
            onEditMeasurement={() => {}}
            canEditClient={canEditClient}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
