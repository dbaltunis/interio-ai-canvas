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
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, Mail, Phone, MapPin, Building2, User, Edit, Calendar, 
  FileText, DollarSign, Star, TrendingUp, Clock, Save, X, Briefcase,
  MessageSquare, Package, CheckCircle
} from "lucide-react";
import { useClient, useUpdateClient } from "@/hooks/useClients";
import { useClientJobs, useClientQuotes, calculateClientDealValue } from "@/hooks/useClientJobs";
import { useConversionProbability } from "@/hooks/useConversionProbability";
import { ClientEmailHistory } from "./ClientEmailHistory";
import { EnhancedClientEmailHistory } from "./EnhancedClientEmailHistory";
import { LeadSourceSelect } from "@/components/crm/LeadSourceSelect";
import { ClientProjectsList } from "./ClientProjectsList";
import { MeasurementsList } from "../measurements/MeasurementsList";
import { TasksList } from "../tasks/TasksList";
import { QuickAddTask } from "../tasks/QuickAddTask";
import { ClientActivityLog } from "./ClientActivityLog";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

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
  const { probability: autoConversionProb, factors } = useConversionProbability(client);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("projects");
  
  // Calculate total value from quotes
  const calculatedDealValue = calculateClientDealValue(quotes || []);

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
      toast({
        title: "Success",
        description: "Client updated successfully",
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

  const handleSyncDealValue = async () => {
    if (calculatedDealValue > 0) {
      setEditedClient({ ...editedClient, deal_value: calculatedDealValue });
      toast({
        title: "Deal value updated",
        description: `Set to $${calculatedDealValue.toLocaleString()} from project quotes`,
      });
    } else {
      toast({
        title: "No quotes found",
        description: "Create quotes for this client's projects to calculate deal value",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditedClient(null);
    setIsEditing(false);
  };

  const currentClient = isEditing ? editedClient : client;
  const clientDisplayName = currentClient.client_type === 'B2B' 
    ? currentClient.company_name 
    : currentClient.name;

  return (
    <div className="max-h-screen overflow-y-auto bg-background p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Avatar className="h-12 w-12 sm:h-16 sm:w-16 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-base sm:text-xl">
              {(clientDisplayName || 'U').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold truncate">{clientDisplayName}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                {currentClient.client_type === 'B2B' ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                {currentClient.client_type || 'B2C'}
              </Badge>
              {currentClient.lead_score && currentClient.lead_score >= 70 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                  <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                  <span className="hidden sm:inline">Hot Lead</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {!isEditing ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("emails");
                  setTimeout(() => {
                    const emailSection = document.getElementById('email-section');
                    if (emailSection) {
                      emailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
                className="h-8 px-2 sm:px-3"
              >
                <Mail className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Email</span>
              </Button>
              <Button size="sm" onClick={handleEdit} className="h-8 px-2 sm:px-3">
                <Edit className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel} className="h-8 px-2 sm:px-3">
                <X className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
              <Button size="sm" onClick={handleSave} className="h-8 px-2 sm:px-3">
                <Save className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deal Value</p>
                <p className="text-2xl font-bold">${(currentClient.deal_value || 0).toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Lead Score</p>
                <p className="text-2xl font-bold">{currentClient.lead_score || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion</p>
                <p className="text-2xl font-bold">{currentClient.conversion_probability || 0}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={editedClient.name || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                  />
                </div>
                
                {editedClient.client_type === 'B2B' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        value={editedClient.company_name || ''}
                        onChange={(e) => setEditedClient({ ...editedClient, company_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_person">Contact Person</Label>
                      <Input
                        id="contact_person"
                        value={editedClient.contact_person || ''}
                        onChange={(e) => setEditedClient({ ...editedClient, contact_person: e.target.value })}
                      />
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedClient.email || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editedClient.phone || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, phone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="funnel_stage">Stage</Label>
                  <Select
                    value={editedClient.funnel_stage || 'lead'}
                    onValueChange={(value) => setEditedClient({ ...editedClient, funnel_stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="measuring_scheduled">Measuring Scheduled</SelectItem>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority_level">Priority</Label>
                  <Select
                    value={editedClient.priority_level || 'medium'}
                    onValueChange={(value) => setEditedClient({ ...editedClient, priority_level: value })}
                  >
                    <SelectTrigger>
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
                
                <div className="space-y-2">
                  <Label htmlFor="lead_source">Lead Source</Label>
                  <LeadSourceSelect 
                    value={editedClient.lead_source || ''} 
                    onValueChange={(value) => setEditedClient({ ...editedClient, lead_source: value })}
                    placeholder="Select lead source"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="deal_value">Deal Value ($)</Label>
                    {calculatedDealValue > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSyncDealValue}
                        className="text-xs h-6 px-2"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Use ${calculatedDealValue.toLocaleString()} from quotes
                      </Button>
                    )}
                  </div>
                  <Input
                    id="deal_value"
                    type="number"
                    value={editedClient.deal_value || 0}
                    onChange={(e) => setEditedClient({ ...editedClient, deal_value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="conversion_probability">Conversion Probability (%)</Label>
                  <Input
                    id="conversion_probability"
                    type="number"
                    min="0"
                    max="100"
                    value={editedClient.conversion_probability || 0}
                    onChange={(e) => setEditedClient({ ...editedClient, conversion_probability: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={editedClient.address || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, address: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={editedClient.city || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, city: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={editedClient.state || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, state: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    value={editedClient.notes || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, notes: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {currentClient.email && (
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:bg-accent/5 p-2 rounded-lg transition-colors"
                      onClick={() => {
                        setActiveTab("emails");
                        setTimeout(() => {
                          const emailSection = document.getElementById('email-section');
                          if (emailSection) {
                            emailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      }}
                    >
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-primary hover:underline">{currentClient.email}</p>
                      </div>
                    </div>
                  )}
                  {currentClient.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{currentClient.phone}</p>
                      </div>
                    </div>
                  )}
                  {(currentClient.address || currentClient.city) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">
                          {currentClient.address || ''}
                          {currentClient.city && `, ${currentClient.city}`}
                          {currentClient.state && `, ${currentClient.state}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Stage</p>
                    <Badge variant="outline">
                      {(currentClient.funnel_stage || 'lead').replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Priority</p>
                    <Badge variant="outline">
                      {(currentClient.priority_level || 'medium').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Lead Source</p>
                    <Badge variant="secondary">
                      {(currentClient.lead_source || 'other').replace('_', ' ')}
                    </Badge>
                  </div>
                  {currentClient.last_contact_date && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Last Contact</p>
                      <p className="font-medium text-sm">
                        {formatDistanceToNow(new Date(currentClient.last_contact_date), { addSuffix: true })}
                      </p>
                    </div>
                  )}
                </div>
                
                {currentClient.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm">{currentClient.notes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side Panel - Combined Tasks & Activity */}
        <Card className="space-y-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Engagement Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Automated Conversion Probability */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversion Probability</span>
                <Badge 
                  variant="outline" 
                  className={`${
                    autoConversionProb >= 70 
                      ? 'bg-green-50 text-green-700 border-green-300' 
                      : autoConversionProb >= 40 
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-300' 
                      : 'bg-red-50 text-red-700 border-red-300'
                  }`}
                >
                  {autoConversionProb}%
                </Badge>
              </div>
              <Progress 
                value={autoConversionProb} 
                className="h-2.5"
              />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Auto-calculated based on:
                </p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className="text-muted-foreground">• Lead score: {factors.leadScore}</span>
                  <span className="text-muted-foreground">• Stage: {factors.stage}</span>
                  <span className="text-muted-foreground">• Emails: {factors.emailEngagement}</span>
                  <span className="text-muted-foreground">• Activity: {factors.activityLevel}</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />
            
            {/* Compact Tasks & Activity Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Tasks & Activity
                </h4>
                <QuickAddTask clientId={clientId} />
              </div>
              
              <TasksList clientId={clientId} compact={true} />
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setActiveTab("activity");
                    setTimeout(() => {
                      const activitySection = document.getElementById('activity-section');
                      if (activitySection) {
                        activitySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  View Full Timeline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          <ClientProjectsList clientId={clientId} onTabChange={onTabChange} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <div id="activity-section">
            <ClientActivityLog clientId={clientId} />
          </div>
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

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No documents uploaded yet</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};