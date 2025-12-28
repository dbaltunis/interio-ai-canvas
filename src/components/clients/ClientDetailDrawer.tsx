import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Mail, Phone, MapPin, Building2, User, File, Activity, 
  Edit2, Check, X, Globe, ExternalLink, StickyNote, Briefcase
} from "lucide-react";
import { ClientFilesManager } from "./ClientFilesManager";
import { ClientActivityLog } from "./ClientActivityLog";
import { ClientEmailHistory } from "./ClientEmailHistory";
import { ClientQuickActionsBar } from "./ClientQuickActionsBar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUpdateClient } from "@/hooks/useClients";
import { FUNNEL_STAGES, getStageByValue } from "@/constants/clientConstants";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  client_type?: string;
  company_name?: string;
  contact_person?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  funnel_stage?: string;
  notes?: string;
  lead_source?: string;
  source?: string;
  created_at?: string;
  stage_changed_at?: string;
}

interface ClientDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  canEdit?: boolean;
}

export const ClientDetailDrawer = ({ open, onOpenChange, client, canEdit = true }: ClientDetailDrawerProps) => {
  const { user } = useAuth();
  const updateClient = useUpdateClient();
  
  // Inline editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [activeTab, setActiveTab] = useState("activity");

  if (!client) return null;

  const displayName = client.client_type === 'B2B' ? client.company_name : client.name;
  const initials = (displayName || 'U').substring(0, 2).toUpperCase();
  const currentStage = getStageByValue(client.funnel_stage || 'lead') || FUNNEL_STAGES[0];
  
  // Lead source display
  const leadSource = client.lead_source || client.source || 'Direct';
  const isExternalLead = leadSource.toLowerCase().includes('external') || 
                         leadSource.toLowerCase().includes('api') ||
                         leadSource.toLowerCase().includes('website');

  const handleStartEdit = (field: string, currentValue: string) => {
    if (!canEdit) return;
    setEditingField(field);
    setEditValue(currentValue || "");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleSaveEdit = async (field: string) => {
    try {
      await updateClient.mutateAsync({
        id: client.id,
        [field]: editValue.trim() || null,
      });
      toast.success("Updated successfully");
      setEditingField(null);
      setEditValue("");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleStageChange = async (newStage: string) => {
    try {
      await updateClient.mutateAsync({
        id: client.id,
        funnel_stage: newStage,
        stage_changed_at: new Date().toISOString(),
      });
      toast.success(`Stage updated to ${getStageByValue(newStage)?.label}`);
    } catch (error) {
      toast.error("Failed to update stage");
    }
  };

  const renderEditableField = (
    field: string,
    value: string | undefined,
    icon: React.ReactNode,
    label: string,
    multiline = false
  ) => {
    const isEditing = editingField === field;
    
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 group">
        <div className="text-muted-foreground mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
          {isEditing ? (
            <div className="flex items-center gap-2">
              {multiline ? (
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="min-h-[60px] text-sm"
                  autoFocus
                />
              ) : (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
              )}
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleSaveEdit(field)}
                  disabled={updateClient.isPending}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium break-words">{value || <span className="text-muted-foreground italic">Not set</span>}</p>
              {canEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleStartEdit(field, value || "")}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        {/* Header with avatar and stage selector */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-xl leading-tight">{displayName}</SheetTitle>
                {client.client_type === 'B2B' && client.contact_person && (
                  <p className="text-sm text-muted-foreground mt-0.5">{client.contact_person}</p>
                )}
                
                {/* Inline Stage Selector */}
                <div className="flex items-center gap-2 mt-2">
                  <Select
                    value={client.funnel_stage || 'lead'}
                    onValueChange={handleStageChange}
                    disabled={!canEdit || updateClient.isPending}
                  >
                    <SelectTrigger className={`w-auto h-7 px-2 text-xs font-medium ${currentStage.color} border-0`}>
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
                  
                  {/* Lead Source Badge */}
                  {isExternalLead ? (
                    <Badge variant="outline" className="text-xs gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {leadSource}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      {leadSource}
                    </Badge>
                  )}
                </div>
                
                {/* Time in stage */}
                {client.stage_changed_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    In this stage {formatDistanceToNow(new Date(client.stage_changed_at), { addSuffix: false })}
                  </p>
                )}
              </div>
            </div>
          </SheetHeader>

          {/* Quick Actions Bar */}
          <div className="px-6 pb-4">
            <ClientQuickActionsBar client={client} />
          </div>
        </div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity" className="text-xs">
                <Activity className="h-3.5 w-3.5 mr-1.5" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs">
                <User className="h-3.5 w-3.5 mr-1.5" />
                Details
              </TabsTrigger>
              <TabsTrigger value="emails" className="text-xs">
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                Emails
              </TabsTrigger>
              <TabsTrigger value="files" className="text-xs">
                <File className="h-3.5 w-3.5 mr-1.5" />
                Files
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="activity" className="p-6 pt-4 m-0">
            <ClientActivityLog clientId={client.id} canEditClient={canEdit} />
          </TabsContent>

          <TabsContent value="details" className="p-6 pt-4 m-0 space-y-3">
            {/* Contact Info */}
            {renderEditableField("email", client.email, <Mail className="h-4 w-4" />, "Email")}
            {renderEditableField("phone", client.phone, <Phone className="h-4 w-4" />, "Phone")}
            
            {/* Location */}
            {renderEditableField(
              "address",
              [client.address, client.city, client.state, client.country].filter(Boolean).join(', ') || undefined,
              <MapPin className="h-4 w-4" />,
              "Location"
            )}
            
            {/* Type */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              {client.client_type === 'B2B' ? (
                <Building2 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium">{client.client_type || 'B2C'}</p>
              </div>
            </div>

            {/* Lead Source Details */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Lead Source</p>
                <p className="text-sm font-medium">{leadSource}</p>
              </div>
            </div>

            {/* Notes */}
            {renderEditableField("notes", client.notes, <StickyNote className="h-4 w-4" />, "Notes", true)}
            
            {/* Created At */}
            {client.created_at && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Added</p>
                  <p className="text-sm font-medium">
                    {new Date(client.created_at).toLocaleDateString()} ({formatDistanceToNow(new Date(client.created_at), { addSuffix: true })})
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="emails" className="p-6 pt-4 m-0">
            <ClientEmailHistory 
              clientId={client.id} 
              clientEmail={client.email}
            />
          </TabsContent>

          <TabsContent value="files" className="p-6 pt-4 m-0">
            {user && (
              <ClientFilesManager 
                clientId={client.id} 
                userId={user.id} 
                canEditClient={canEdit}
              />
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
