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
  FileText, DollarSign, Clock, Save, X, Briefcase, Package, ChevronDown, ChevronUp, MessageCircle, Globe, Link, Tag, CalendarDays, Users, MessageSquare
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ClientQuickActionsBar } from "./ClientQuickActionsBar";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { useClient, useUpdateClient, useUpdateClientStage } from "@/hooks/useClients";
import { useClientJobs } from "@/hooks/useClientJobs";
import { useClientFiles } from "@/hooks/useClientFiles";
import { useCanEditClient } from "@/hooks/useClientEditPermissions";
import { ClientCommunicationsTab } from "./ClientCommunicationsTab";
import { LeadSourceSelect } from "@/components/crm/LeadSourceSelect";
import { ClientProjectsList } from "./ClientProjectsList";
import { ClientMeasurementsTab } from "./ClientMeasurementsTab";
import { ClientActivityLog } from "./ClientActivityLog";
import { ClientAllNotesSection } from "./ClientAllNotesSection";
import { ClientAppointmentsTab } from "./ClientAppointmentsTab";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ClientFilesManager } from "./ClientFilesManager";
import { useAuth } from "@/components/auth/AuthProvider";
import { FUNNEL_STAGES } from "@/constants/clientConstants";
import { useClientStages } from "@/hooks/useClientStages";
import { ClientInquiriesPanel } from "./ClientInquiriesPanel";
import { useClientInquiries } from "@/hooks/useClientInquiries";

interface ClientProfilePageProps {
  clientId: string;
  onBack: () => void;
  onEdit: () => void;
  onTabChange?: (tab: string) => void;
}

export const ClientProfilePage = ({ clientId, onBack, onTabChange }: ClientProfilePageProps) => {
  const { data: client, isLoading: clientLoading } = useClient(clientId);
  const { data: projects } = useClientJobs(clientId);
  const updateClient = useUpdateClient();
  const updateClientStage = useUpdateClientStage();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: clientFiles } = useClientFiles(clientId, user?.id || '');
  const { formatCurrency } = useFormattedCurrency();
  const { data: dynamicStages = [] } = useClientStages();
  
  // Color mapping for dynamic stages
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      gray: "bg-gray-100 text-gray-700",
      blue: "bg-blue-100 text-blue-700",
      green: "bg-green-100 text-green-700",
      yellow: "bg-yellow-100 text-yellow-700",
      orange: "bg-orange-100 text-orange-700",
      red: "bg-red-100 text-red-700",
      purple: "bg-purple-100 text-purple-700",
      primary: "bg-primary/10 text-primary",
    };
    return colorMap[color] || colorMap.gray;
  };

  // Use dynamic stages if available, otherwise fallback to hardcoded
  const stages = dynamicStages.length > 0
    ? dynamicStages.map(s => ({ 
        value: s.name, 
        label: s.label, 
        color: getColorClasses(s.color || 'gray') 
      }))
    : FUNNEL_STAGES;
  const { canEditClient, canEditAllClients, isLoading: editPermissionLoading } = useCanEditClient(client);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("notes");
  const [detailsOpen, setDetailsOpen] = useState(true);

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

  const getStageColor = (stageValue: string) => {
    const stageData = stages.find(s => s.value === stageValue);
    return stageData?.color || 'bg-muted text-muted-foreground';
  };
  
  const getStageLabel = (stageValue: string) => {
    const stageData = stages.find(s => s.value === stageValue);
    return stageData?.label || stageValue;
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
                    const previousStage = currentClient.funnel_stage;
                    await updateClientStage.mutateAsync({ clientId: client.id, stage: value, previousStage });
                  } catch (error) {
                    toast({ title: "Failed to update", variant: "destructive" });
                  }
                }}
                disabled={!canEditClient}
              >
                <SelectTrigger className="w-auto h-6 px-2 border-0 bg-transparent hover:bg-muted/50 p-0">
                  <Badge className={`${getStageColor(currentClient.funnel_stage || 'lead')} text-xs`}>
                    {getStageLabel(currentClient.funnel_stage || 'lead')}
                  </Badge>
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
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
          {currentClient.deal_value && currentClient.deal_value > 0 ? (
            <Badge variant="outline" className="gap-1 text-xs font-medium bg-green-50 border-green-200">
              <DollarSign className="h-3 w-3 text-green-600" />
              {formatCurrency(currentClient.deal_value)} deal
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-xs font-medium">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              No deal value
            </Badge>
          )}
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
        <div className="lg:col-span-5 space-y-3">
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <Card variant="analytics">
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
                      {/* B2B-specific fields */}
                      {currentClient.client_type === 'B2B' && (
                        <>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Company Name</Label>
                            <Input
                              value={editedClient.company_name || ''}
                              onChange={(e) => setEditedClient({ ...editedClient, company_name: e.target.value })}
                              className="h-7 text-xs"
                              placeholder="Company name"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Contact Person</Label>
                            <Input
                              value={editedClient.contact_person || ''}
                              onChange={(e) => setEditedClient({ ...editedClient, contact_person: e.target.value })}
                              className="h-7 text-xs"
                              placeholder="Primary contact at company"
                            />
                          </div>
                        </>
                      )}
                      <div className="space-y-1">
                        <Label className="text-[10px]">Name</Label>
                        <Input
                          value={editedClient.name || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                          className="h-7 text-xs"
                          placeholder="Client name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Email</Label>
                        <Input
                          type="email"
                          value={editedClient.email || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
                          className="h-7 text-xs"
                          placeholder="Email address"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Phone</Label>
                        <Input
                          value={editedClient.phone || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, phone: e.target.value })}
                          className="h-7 text-xs"
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Address</Label>
                        <Input
                          value={editedClient.address || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, address: e.target.value })}
                          className="h-7 text-xs"
                          placeholder="Address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px]">City</Label>
                          <Input
                            value={editedClient.city || ''}
                            onChange={(e) => setEditedClient({ ...editedClient, city: e.target.value })}
                            className="h-7 text-xs"
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">State</Label>
                          <Input
                            value={editedClient.state || ''}
                            onChange={(e) => setEditedClient({ ...editedClient, state: e.target.value })}
                            className="h-7 text-xs"
                            placeholder="State/Province"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px]">Zip Code</Label>
                          <Input
                            value={editedClient.zip_code || ''}
                            onChange={(e) => setEditedClient({ ...editedClient, zip_code: e.target.value })}
                            className="h-7 text-xs"
                            placeholder="Zip/Postal Code"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">Country</Label>
                          <Input
                            value={editedClient.country || ''}
                            onChange={(e) => setEditedClient({ ...editedClient, country: e.target.value })}
                            className="h-7 text-xs"
                            placeholder="Country"
                          />
                        </div>
                      </div>
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
                            <SelectItem value="urgent">Urgent</SelectItem>
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
                      <div className="space-y-1">
                        <Label className="text-[10px]">Referral Source</Label>
                        <Input
                          value={editedClient.referral_source || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, referral_source: e.target.value })}
                          className="h-7 text-xs"
                          placeholder="Who referred this client?"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Deal Value</Label>
                        <Input
                          type="number"
                          value={editedClient.deal_value || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, deal_value: e.target.value ? parseFloat(e.target.value) : null })}
                          className="h-7 text-xs"
                          placeholder="Expected deal value"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Follow-up Date</Label>
                        <Input
                          type="date"
                          value={editedClient.follow_up_date ? new Date(editedClient.follow_up_date).toISOString().split('T')[0] : ''}
                          onChange={(e) => setEditedClient({ ...editedClient, follow_up_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Tags (comma separated)</Label>
                        <Input
                          value={editedClient.tags?.join(', ') || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, tags: e.target.value ? e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean) : null })}
                          className="h-7 text-xs"
                          placeholder="VIP, Corporate, etc."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Notes</Label>
                        <Textarea
                          value={editedClient.notes || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, notes: e.target.value })}
                          className="text-xs min-h-[60px]"
                          placeholder="Additional notes..."
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
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{currentClient.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{currentClient.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{currentClient.address || 'No address'}</span>
                      </div>
                      {currentClient.company_name && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{currentClient.company_name}</span>
                        </div>
                      )}
                      {currentClient.country && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{currentClient.country}</span>
                        </div>
                      )}
                      {(currentClient.source || currentClient.lead_source) && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {currentClient.source && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              {currentClient.source}
                            </Badge>
                          )}
                          {currentClient.lead_source && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              {currentClient.lead_source}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-0.5">
                        <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${
                          currentClient.priority_level === 'high' || currentClient.priority_level === 'urgent' ? 'bg-red-100 text-red-700' :
                          currentClient.priority_level === 'low' ? 'bg-gray-100 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {(currentClient.priority_level || 'medium').toUpperCase()}
                        </Badge>
                      </div>
                      
                      {/* Tags Display */}
                      {currentClient.tags && currentClient.tags.length > 0 && (
                        <div className="flex items-start gap-2 pt-1">
                          <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="flex flex-wrap gap-1">
                            {currentClient.tags.map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Follow-up Date Display */}
                      {currentClient.follow_up_date && (
                        <div className="flex items-center gap-2 pt-1">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs">
                            Follow-up: {new Date(currentClient.follow_up_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {/* Referral Source Display */}
                      {currentClient.referral_source && (
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground">Referred by: {currentClient.referral_source}</span>
                        </div>
                      )}
                      
                      {currentClient.notes && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <div className="flex items-start gap-2">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-muted-foreground text-xs whitespace-pre-wrap line-clamp-4">
                              {currentClient.notes}
                            </span>
                          </div>
                        </div>
                      )}
                      {canEditClient && (
                        <Button variant="outline" size="sm" onClick={handleEdit} className="w-full mt-2 h-7 text-xs">
                          <Edit className="h-3 w-3 mr-1" /> Edit
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
            <Card variant="analytics">
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
          <Card variant="analytics">
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
        <div className="lg:col-span-3">
          <ClientCommunicationsTab 
            clientId={clientId} 
            clientEmail={client.email}
          />
        </div>
      </div>

      {/* Client Projects Section - Only show if user has edit_all_clients permission */}
      {canEditClient && (
        <ClientProjectsList clientId={clientId} onTabChange={onTabChange} />
      )}
      {/* Inquiries Panel - Shows all form submissions */}
      <ClientInquiriesPanel clientId={clientId} />

      {/* Secondary Content Tabs - Notes, Activity, Measurements, Appointments */}
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
          <TabsTrigger value="appointments" className="text-xs gap-1 px-2.5 h-7 data-[state=active]:bg-background">
            <CalendarDays className="h-3 w-3" />
            Appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-3">
          <ClientAllNotesSection clientId={clientId} canEditClient={canEditClient} />
        </TabsContent>

        <TabsContent value="activity" className="mt-3">
          <ClientActivityLog clientId={clientId} canEditClient={canEditClient} />
        </TabsContent>

        <TabsContent value="measurements" className="mt-3">
          <ClientMeasurementsTab
            clientId={clientId}
            canEditClient={canEditClient}
          />
        </TabsContent>

        <TabsContent value="appointments" className="mt-3">
          <ClientAppointmentsTab clientId={clientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
