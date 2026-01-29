import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, ArrowRight, Check, Send, Users, FileText, 
  Calendar as CalendarIcon, Clock, CheckCircle2, Mail, 
  Loader2, X, Search, User, Building, Filter
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";
import { useClientLists, ClientList } from "@/hooks/useClientLists";
import { useCreateEmailCampaign } from "@/hooks/useEmailCampaigns";
import { useCampaignExecution } from "@/hooks/useCampaignExecution";
import { useGeneralEmailTemplates } from "@/hooks/useGeneralEmailTemplates";
import { toast } from "sonner";
import { SelectedClient } from "@/hooks/useClientSelection";


const STEPS = [
  { id: 1, key: 'recipients', title: 'Recipients', icon: Users, description: 'Choose who receives this campaign' },
  { id: 2, key: 'content', title: 'Content', icon: FileText, description: 'Write your message' },
  { id: 3, key: 'schedule', title: 'Schedule', icon: CalendarIcon, description: 'When to send' },
  { id: 4, key: 'review', title: 'Review', icon: CheckCircle2, description: 'Review and launch' },
];

interface CampaignFormData {
  name: string;
  subject: string;
  content: string;
  selectedClients: SelectedClient[];
  selectedListId: string | null;
  sendImmediately: boolean;
  scheduledDate: Date | undefined;
  scheduledTime: string;
  dripEnabled: boolean;
  dripPerDay: number;
}

export const CampaignBuilderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [funnelFilter, setFunnelFilter] = useState<string>("all");
  
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    subject: '',
    content: '',
    selectedClients: [],
    selectedListId: null,
    sendImmediately: true,
    scheduledDate: undefined,
    scheduledTime: '09:00',
    dripEnabled: false,
    dripPerDay: 10,
  });

  const { data: clients = [] } = useClients();
  const { data: lists = [] } = useClientLists();
  const { data: templates = [] } = useGeneralEmailTemplates();
  const createCampaign = useCreateEmailCampaign();
  const executeCampaign = useCampaignExecution();

  // Load template if specified
  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setFormData(prev => ({
          ...prev,
          name: `${template.template_type} Campaign`,
          subject: template.subject || '',
          content: template.content || '',
        }));
        setCurrentStep(2); // Skip to content step
      }
    }
  }, [templateId, templates]);

  // Convert clients to SelectedClient format
  const availableClients: SelectedClient[] = useMemo(() => {
    return clients
      .filter(c => c.email)
      .map(c => ({
        id: c.id,
        name: c.name,
        email: c.email || undefined,
        company_name: c.company_name || undefined,
        funnel_stage: c.funnel_stage || undefined,
      }));
  }, [clients]);

  // Filter clients for display
  const filteredClients = useMemo(() => {
    return availableClients.filter(client => {
      const matchesSearch = 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFunnel = funnelFilter === 'all' || client.funnel_stage === funnelFilter;
      return matchesSearch && matchesFunnel;
    });
  }, [availableClients, searchTerm, funnelFilter]);

  // Get unique funnel stages for filter
  const funnelStages = useMemo(() => {
    const stages = new Set(availableClients.map(c => c.funnel_stage).filter(Boolean));
    return Array.from(stages) as string[];
  }, [availableClients]);

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const toggleClient = (client: SelectedClient) => {
    const isSelected = formData.selectedClients.some(c => c.id === client.id);
    if (isSelected) {
      updateFormData({ 
        selectedClients: formData.selectedClients.filter(c => c.id !== client.id) 
      });
    } else {
      updateFormData({ 
        selectedClients: [...formData.selectedClients, client] 
      });
    }
  };

  const selectAllFiltered = () => {
    const newSelection = [...formData.selectedClients];
    filteredClients.forEach(client => {
      if (!newSelection.some(c => c.id === client.id)) {
        newSelection.push(client);
      }
    });
    updateFormData({ selectedClients: newSelection });
  };

  const clearSelection = () => {
    updateFormData({ selectedClients: [] });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.selectedClients.length > 0;
      case 2: return formData.name.trim() && formData.subject.trim() && formData.content.trim();
      case 3: return formData.sendImmediately || formData.scheduledDate;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleLaunch = async () => {
    setIsSending(true);
    
    try {
      const campaign = await createCampaign.mutateAsync({
        name: formData.name,
        subject: formData.subject,
        content: formData.content,
        status: formData.sendImmediately ? 'sending' : 'scheduled',
        scheduled_at: formData.scheduledDate?.toISOString(),
        recipient_count: formData.selectedClients.length,
      });

      if (formData.sendImmediately) {
        await executeCampaign.mutateAsync({
          campaignId: campaign.id,
          campaignData: {
            name: formData.name,
            subject: formData.subject,
            content: formData.content,
            selectedClients: formData.selectedClients,
            personalization: {
              useClientName: true,
              useCompanyName: true,
            },
          },
        });
      }

      toast.success(
        formData.sendImmediately 
          ? `Campaign "${formData.name}" sent to ${formData.selectedClients.length} recipients!`
          : `Campaign "${formData.name}" scheduled successfully!`
      );
      
      navigate('/messages?tab=campaigns');
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast.error('Failed to create campaign. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {formData.name || 'New Campaign'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {formData.selectedClients.length} recipient{formData.selectedClients.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              {currentStep === STEPS.length ? (
                <Button 
                  onClick={handleLaunch}
                  disabled={isSending}
                  className="gap-2"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Launch Campaign
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-4">
            <Progress value={progress} className="h-1 mb-3" />
            <div className="flex justify-between">
              {STEPS.map((step) => {
                const StepIcon = step.icon;
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                    disabled={step.id > currentStep}
                    className={cn(
                      "flex items-center gap-2 text-sm transition-colors",
                      isCurrent && "text-primary font-medium",
                      isCompleted && "text-muted-foreground cursor-pointer hover:text-foreground",
                      step.id > currentStep && "text-muted-foreground/50 cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs",
                      isCurrent && "bg-primary text-primary-foreground",
                      isCompleted && "bg-primary/20 text-primary",
                      step.id > currentStep && "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                    </div>
                    <span className="hidden sm:inline">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Recipients */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Select Recipients
                  </CardTitle>
                  <CardDescription>
                    Choose which clients will receive this campaign
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={funnelFilter} onValueChange={setFunnelFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Stages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stages</SelectItem>
                        {funnelStages.map(stage => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={selectAllFiltered}
                      >
                        Select All ({filteredClients.length})
                      </Button>
                      {formData.selectedClients.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={clearSelection}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {formData.selectedClients.length} selected
                    </Badge>
                  </div>

                  {/* Client List */}
                  <ScrollArea className="h-[400px] border rounded-lg">
                    <div className="divide-y">
                      {filteredClients.map(client => {
                        const isSelected = formData.selectedClients.some(c => c.id === client.id);
                        return (
                          <button
                            key={client.id}
                            onClick={() => toggleClient(client)}
                            className={cn(
                              "w-full flex items-center gap-3 p-4 text-left transition-colors",
                              isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                              isSelected 
                                ? "bg-primary border-primary text-primary-foreground" 
                                : "border-muted-foreground/30"
                            )}>
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{client.name}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {client.email}
                              </div>
                            </div>
                            {client.company_name && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Building className="h-3 w-3" />
                                <span className="truncate max-w-[100px]">{client.company_name}</span>
                              </div>
                            )}
                            {client.funnel_stage && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                {client.funnel_stage}
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                      {filteredClients.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                          No clients match your search
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Content */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Campaign Content
                  </CardTitle>
                  <CardDescription>
                    Write your email message
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input
                      id="campaign-name"
                      placeholder="e.g., January Newsletter"
                      value={formData.name}
                      onChange={e => updateFormData({ name: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Internal name - recipients won't see this
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Exciting news from our team!"
                      value={formData.subject}
                      onChange={e => updateFormData({ subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Message</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your email content here...

You can use these personalization tags:
• {{client_name}} - Client's name
• {{company_name}} - Client's company"
                      value={formData.content}
                      onChange={e => updateFormData({ content: e.target.value })}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Schedule */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Send Schedule
                  </CardTitle>
                  <CardDescription>
                    Choose when to send your campaign
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Send Options */}
                  <div className="space-y-4">
                    <button
                      onClick={() => updateFormData({ sendImmediately: true })}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-colors",
                        formData.sendImmediately 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        formData.sendImmediately 
                          ? "border-primary bg-primary" 
                          : "border-muted-foreground/50"
                      )}>
                        {formData.sendImmediately && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Send Immediately</div>
                        <div className="text-sm text-muted-foreground">
                          Campaign will be sent right after you launch
                        </div>
                      </div>
                      <Send className="h-5 w-5 text-muted-foreground" />
                    </button>

                    <button
                      onClick={() => updateFormData({ sendImmediately: false })}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-colors",
                        !formData.sendImmediately 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        !formData.sendImmediately 
                          ? "border-primary bg-primary" 
                          : "border-muted-foreground/50"
                      )}>
                        {!formData.sendImmediately && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Schedule for Later</div>
                        <div className="text-sm text-muted-foreground">
                          Pick a date and time
                        </div>
                      </div>
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Schedule Picker */}
                  {!formData.sendImmediately && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.scheduledDate 
                                  ? format(formData.scheduledDate, 'PPP')
                                  : 'Pick a date'
                                }
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={formData.scheduledDate}
                                onSelect={(date) => updateFormData({ scheduledDate: date })}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label>Time</Label>
                          <Select 
                            value={formData.scheduledTime} 
                            onValueChange={(time) => updateFormData({ scheduledTime: time })}
                          >
                            <SelectTrigger>
                              <Clock className="h-4 w-4 mr-2" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }).map((_, hour) => (
                                <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                                  {format(new Date().setHours(hour, 0), 'h:mm a')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Drip Schedule (Coming Soon) */}
                      <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">Send Over Time (Drip)</div>
                            <div className="text-xs text-muted-foreground">
                              Spread emails across multiple days
                            </div>
                          </div>
                          <Badge variant="secondary">Coming Soon</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Review Campaign
                  </CardTitle>
                  <CardDescription>
                    Review your campaign before sending
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1">Campaign Name</div>
                      <div className="font-medium">{formData.name}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1">Subject Line</div>
                      <div className="font-medium">{formData.subject}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1">Recipients</div>
                      <div className="font-medium">{formData.selectedClients.length} contacts</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.selectedClients.slice(0, 5).map(c => (
                          <Badge key={c.id} variant="outline" className="text-xs">
                            {c.name}
                          </Badge>
                        ))}
                        {formData.selectedClients.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{formData.selectedClients.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1">Schedule</div>
                      <div className="font-medium">
                        {formData.sendImmediately 
                          ? 'Send immediately' 
                          : formData.scheduledDate 
                            ? `${format(formData.scheduledDate, 'PPP')} at ${formData.scheduledTime}`
                            : 'Not scheduled'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="space-y-2">
                    <Label>Email Preview</Label>
                    <div className="border rounded-lg p-4 bg-background max-h-[300px] overflow-y-auto">
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {formData.content || 'No content'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Selected Recipients Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Recipients ({formData.selectedClients.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.selectedClients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No recipients selected yet
                  </p>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {formData.selectedClients.map(client => (
                        <div 
                          key={client.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                              <User className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm truncate">{client.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => toggleClient(client)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Deliverability Info */}
            {currentStep >= 2 && formData.subject && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Subject: </span>
                      <span className="font-medium">{formData.subject}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Recipients: </span>
                      <span className="font-medium">{formData.selectedClients.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips Card */}
            <Card className="bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">💡 Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                {currentStep === 1 && (
                  <>
                    <p>• Select clients with valid email addresses</p>
                    <p>• Use filters to find specific client groups</p>
                    <p>• Create lists to save common selections</p>
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <p>• Keep subject lines under 50 characters</p>
                    <p>• Use personalization tags for better engagement</p>
                    <p>• Avoid spam trigger words in all caps</p>
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <p>• Best send times: 9-10 AM or 2-3 PM</p>
                    <p>• Tuesday-Thursday have higher open rates</p>
                    <p>• Schedule for your recipients' timezone</p>
                  </>
                )}
                {currentStep === 4 && (
                  <>
                    <p>• Double-check recipient list</p>
                    <p>• Preview your email content</p>
                    <p>• Confirm send schedule is correct</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignBuilderPage;
