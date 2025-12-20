import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, Mail, Phone, MapPin, Building2, User, Edit, Calendar, 
  FileText, DollarSign, Clock, Save, X, Briefcase, Package
} from "lucide-react";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { useClient, useUpdateClient } from "@/hooks/useClients";
import { useClientJobs, useClientQuotes } from "@/hooks/useClientJobs";
import { useClientFiles } from "@/hooks/useClientFiles";
import { EnhancedClientEmailHistory } from "./EnhancedClientEmailHistory";
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("activity");
  
  // Calculate portfolio value from closed/completed projects only
  // Use project.quote data since quotes may not have client_id set directly
  const closedProjects = (projects || []).filter(p => 
    ['closed', 'completed'].includes(p.status?.toLowerCase() || '')
  );
  
  // Sum total_amount from quotes linked to closed projects
  // Note: quotes may have client_id NULL but are linked via project_id
  const portfolioValue = closedProjects.reduce((sum, project) => {
    // Find quotes for this project
    const projectQuotes = (quotes || []).filter(q => q.project_id === project.id);
    if (projectQuotes.length > 0) {
      // Use the latest quote's total_amount
      const latestQuote = projectQuotes[0]; // Already sorted by created_at desc
      return sum + parseFloat(latestQuote.total_amount?.toString() || '0');
    }
    return sum;
  }, 0);

  if (clientLoading) {
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
    <div className="max-h-screen overflow-y-auto bg-background p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-base sm:text-xl">
            {(clientDisplayName || 'U').substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-lg sm:text-2xl font-bold">{clientDisplayName}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              {currentClient.client_type === 'B2B' ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {currentClient.client_type || 'B2C'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Client Information - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Client Information</CardTitle>
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEdit}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{currentClient.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{currentClient.phone || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage">Stage</Label>
                  <Select 
                    value={editedClient.funnel_stage || 'lead'}
                    onValueChange={(value) => setEditedClient({ ...editedClient, funnel_stage: value })}
                  >
                    <SelectTrigger id="stage">
                      <SelectValue />
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={editedClient.priority || 'medium'}
                    onValueChange={(value) => setEditedClient({ ...editedClient, priority: value })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead_source">Lead Source</Label>
                  <LeadSourceSelect
                    value={editedClient.lead_source || 'other'}
                    onValueChange={(value) => setEditedClient({ ...editedClient, lead_source: value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{currentClient.address || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateClient.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateClient.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateClient.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p className="font-medium">{currentClient.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </p>
                <p className="font-medium">{currentClient.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Stage</p>
                <Select 
                  value={currentClient.funnel_stage || 'lead'}
                  onValueChange={async (value) => {
                    try {
                      await updateClient.mutateAsync({
                        id: client.id,
                        funnel_stage: value,
                      });
                      toast({ title: "Stage updated" });
                    } catch (error) {
                      toast({ title: "Failed to update stage", variant: "destructive" });
                    }
                  }}
                >
                  <SelectTrigger className="w-fit h-auto py-1 px-2 border-0 bg-transparent hover:bg-muted/50">
                    <Badge className={getStageColor(currentClient.funnel_stage || 'lead')}>
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
              <div>
                <p className="text-sm text-muted-foreground mb-2">Priority</p>
                <Select 
                  value={currentClient.priority_level || 'medium'}
                  onValueChange={async (value) => {
                    try {
                      await updateClient.mutateAsync({
                        id: client.id,
                        priority_level: value,
                      });
                      toast({ title: "Priority updated" });
                    } catch (error) {
                      toast({ title: "Failed to update priority", variant: "destructive" });
                    }
                  }}
                >
                  <SelectTrigger className="w-fit h-auto py-1 px-2 border-0 bg-transparent hover:bg-muted/50">
                    <Badge variant="secondary" className={
                      currentClient.priority_level === 'high' ? 'bg-red-100 text-red-700' :
                      currentClient.priority_level === 'low' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {(currentClient.priority_level || 'medium').toUpperCase()}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Lead Source</p>
                <Badge variant="outline">
                  {(currentClient.lead_source || 'other').replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </p>
                <p className="font-medium text-sm">{currentClient.address || 'Not provided'}</p>
              </div>
              {currentClient.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </p>
                  <p className="text-sm">{currentClient.notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold">{formatCurrency(portfolioValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">{projects?.length || 0}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Files</p>
                <p className="text-2xl font-bold">{clientFiles?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Contact</p>
                <p className="text-lg font-bold">
                  {currentClient.last_contact_date 
                    ? formatDistanceToNow(new Date(currentClient.last_contact_date), { addSuffix: true })
                    : 'Never'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Projects Section */}
      <ClientProjectsList clientId={clientId} onTabChange={onTabChange} />

      {/* Client Files Section */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Files & Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientFilesManager clientId={clientId} userId={user.id} />
          </CardContent>
        </Card>
      )}

      {/* All Project Notes Section */}
      <ClientAllNotesSection clientId={clientId} />

      {/* Redesigned Tabs Section - 3 tabs: Activity, Emails, Measurements */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">More Details</h3>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/30">
            <TabsTrigger 
              value="activity" 
              className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Clock className="h-5 w-5" />
              <span className="font-medium">Activity</span>
            </TabsTrigger>
            <TabsTrigger 
              value="emails" 
              className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Mail className="h-5 w-5" />
              <span className="font-medium">Emails</span>
            </TabsTrigger>
            <TabsTrigger 
              value="measurements" 
              className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Package className="h-5 w-5" />
              <span className="font-medium">Measurements</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-6">
            <ClientActivityLog clientId={clientId} />
          </TabsContent>

          <TabsContent value="emails" className="mt-6">
            <EnhancedClientEmailHistory 
              clientId={clientId} 
              clientEmail={client.email}
              onComposeEmail={() => {}}
            />
          </TabsContent>

          <TabsContent value="measurements" className="mt-6">
            <MeasurementsList 
              clientId={clientId}
              onViewMeasurement={() => {}}
              onEditMeasurement={() => {}}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};