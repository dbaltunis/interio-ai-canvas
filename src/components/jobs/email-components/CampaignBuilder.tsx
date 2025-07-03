import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon, 
  Users, 
  Mail, 
  Settings, 
  Eye, 
  Send,
  Clock,
  Target,
  BarChart3,
  Plus,
  X,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { useClients } from "@/hooks/useClients";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import { useToast } from "@/hooks/use-toast";
import { predefinedEmailTemplates } from "@/data/emailTemplates";
import { EmailPreviewDialog } from "./EmailPreviewDialog";

interface CampaignBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: any;
  onSave: (campaignData: any) => void;
  onLaunch: (campaignData: any) => void;
}

export const CampaignBuilder = ({
  open,
  onOpenChange,
  campaign,
  onSave,
  onLaunch
}: CampaignBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignData, setCampaignData] = useState({
    name: "",
    subject: "",
    content: "",
    template_id: "",
    selectedClients: [] as any[],
    scheduledAt: null as Date | null,
    sendImmediately: true,
    trackOpens: true,
    trackClicks: true,
    personalization: {
      useClientName: true,
      useCompanyName: false
    }
  });
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: clients } = useClients();
  const { data: templates } = useEmailTemplates();
  const { toast } = useToast();

  const steps = [
    { id: 'setup', title: 'Campaign Setup', icon: Settings },
    { id: 'recipients', title: 'Select Recipients', icon: Users },
    { id: 'content', title: 'Email Content', icon: Mail },
    { id: 'schedule', title: 'Schedule & Settings', icon: Clock },
    { id: 'review', title: 'Review & Launch', icon: Eye }
  ];

  useEffect(() => {
    if (campaign) {
      setCampaignData({
        name: campaign.name || "",
        subject: campaign.subject || "",
        content: campaign.content || "",
        template_id: campaign.template_id || "",
        selectedClients: [],
        scheduledAt: campaign.scheduled_at ? new Date(campaign.scheduled_at) : null,
        sendImmediately: !campaign.scheduled_at,
        trackOpens: true,
        trackClicks: true,
        personalization: {
          useClientName: true,
          useCompanyName: false
        }
      });
    }
  }, [campaign]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    if (!campaignData.name || !campaignData.subject || !campaignData.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in campaign name, subject, and content",
        variant: "destructive"
      });
      return;
    }

    const saveData = {
      ...campaignData,
      status: 'draft',
      recipient_count: campaignData.selectedClients.length,
      scheduled_at: campaignData.sendImmediately ? null : campaignData.scheduledAt?.toISOString()
    };

    onSave(saveData);
    onOpenChange(false);
  };

  const handleLaunch = () => {
    if (!campaignData.name || !campaignData.subject || !campaignData.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (campaignData.selectedClients.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please select at least one recipient",
        variant: "destructive"
      });
      return;
    }

    const launchData = {
      ...campaignData,
      status: campaignData.sendImmediately ? 'sending' : 'scheduled',
      recipient_count: campaignData.selectedClients.length,
      scheduled_at: campaignData.sendImmediately ? null : campaignData.scheduledAt?.toISOString()
    };

    onLaunch(launchData);
    onOpenChange(false);
  };

  const handleUseTemplate = (templateId: string) => {
    const template = predefinedEmailTemplates.find(t => t.id === templateId) || 
                    templates?.find(t => t.id === templateId);
    
    if (template) {
      setCampaignData(prev => ({
        ...prev,
        template_id: templateId,
        subject: template.subject,
        content: template.content
      }));
      toast({
        title: "Template Applied",
        description: `${template.name} template has been applied to your campaign.`
      });
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
              isActive ? 'border-primary bg-primary text-white' :
              isCompleted ? 'border-green-500 bg-green-500 text-white' :
              'border-gray-300 bg-gray-100 text-gray-500'
            }`}>
              {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {campaign ? 'Edit Campaign' : 'Create New Campaign'}
            </DialogTitle>
            <DialogDescription>
              Build and launch your email campaign with advanced tracking and personalization
            </DialogDescription>
          </DialogHeader>

          <StepIndicator />

          <div className="space-y-6">
            {/* Step 1: Campaign Setup */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input
                      id="campaign-name"
                      placeholder="Enter campaign name..."
                      value={campaignData.name}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaign-subject">Email Subject Line</Label>
                    <Input
                      id="campaign-subject"
                      placeholder="Enter email subject..."
                      value={campaignData.subject}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Recipients */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Recipients</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {clients?.map((client) => (
                      <div key={client.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={campaignData.selectedClients.some(c => c.id === client.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCampaignData(prev => ({
                                ...prev,
                                selectedClients: [...prev.selectedClients, client]
                              }));
                            } else {
                              setCampaignData(prev => ({
                                ...prev,
                                selectedClients: prev.selectedClients.filter(c => c.id !== client.id)
                              }));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-600">{client.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      {campaignData.selectedClients.length} recipients selected
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCampaignData(prev => ({ ...prev, selectedClients: clients || [] }))}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCampaignData(prev => ({ ...prev, selectedClients: [] }))}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Content */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Email Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    <Select onValueChange={handleUseTemplate}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Choose template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No template</SelectItem>
                        {predefinedEmailTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                        {templates?.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="campaign-content">Email Content</Label>
                    <Textarea
                      id="campaign-content"
                      placeholder="Write your email content here..."
                      className="min-h-64"
                      value={campaignData.content}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, content: e.target.value }))}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Personalization Options</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={campaignData.personalization.useClientName}
                          onCheckedChange={(checked) => setCampaignData(prev => ({
                            ...prev,
                            personalization: { ...prev.personalization, useClientName: !!checked }
                          }))}
                        />
                        <Label>Use client name ({"{{client_name}}"})</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={campaignData.personalization.useCompanyName}
                          onCheckedChange={(checked) => setCampaignData(prev => ({
                            ...prev,
                            personalization: { ...prev.personalization, useCompanyName: !!checked }
                          }))}
                        />
                        <Label>Use company name ({"{{company_name}}"})</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Schedule & Settings */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Schedule & Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={campaignData.sendImmediately}
                        onCheckedChange={(checked) => setCampaignData(prev => ({ ...prev, sendImmediately: !!checked }))}
                      />
                      <Label>Send immediately</Label>
                    </div>
                    
                    {!campaignData.sendImmediately && (
                      <div>
                        <Label>Schedule for later</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {campaignData.scheduledAt ? format(campaignData.scheduledAt, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={campaignData.scheduledAt}
                              onSelect={(date) => setCampaignData(prev => ({ ...prev, scheduledAt: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Tracking Settings</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={campaignData.trackOpens}
                          onCheckedChange={(checked) => setCampaignData(prev => ({ ...prev, trackOpens: !!checked }))}
                        />
                        <Label>Track email opens</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={campaignData.trackClicks}
                          onCheckedChange={(checked) => setCampaignData(prev => ({ ...prev, trackClicks: !!checked }))}
                        />
                        <Label>Track link clicks</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Review */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Launch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Campaign Name</p>
                      <p className="text-gray-600">{campaignData.name}</p>
                    </div>
                    <div>
                      <p className="font-medium">Subject Line</p>
                      <p className="text-gray-600">{campaignData.subject}</p>
                    </div>
                    <div>
                      <p className="font-medium">Recipients</p>
                      <p className="text-gray-600">{campaignData.selectedClients.length} contacts</p>
                    </div>
                    <div>
                      <p className="font-medium">Delivery</p>
                      <p className="text-gray-600">
                        {campaignData.sendImmediately ? 'Send immediately' : 
                         campaignData.scheduledAt ? format(campaignData.scheduledAt, "PPP") : 'Not scheduled'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Ready to Launch!</h4>
                    <p className="text-green-700 text-sm">
                      Your campaign is configured and ready to send. All emails will be tracked for opens, clicks, and engagement.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSave}>
                Save Draft
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button onClick={handleLaunch} className="bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4 mr-2" />
                  Launch Campaign
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EmailPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        template={{
          id: 'campaign-preview',
          name: 'Campaign Preview',
          subject: campaignData.subject,
          content: campaignData.content,
          category: 'Campaign',
          variables: []
        }}
        clientData={campaignData.selectedClients[0]}
      />
    </>
  );
};