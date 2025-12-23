import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Send, X } from "lucide-react";
import { SelectedClient } from "@/hooks/useClientSelection";
import { CampaignRecipientsStep } from "./steps/CampaignRecipientsStep";
import { CampaignTypeStep } from "./steps/CampaignTypeStep";
import { CampaignContentStep } from "./steps/CampaignContentStep";
import { CampaignScheduleStep } from "./steps/CampaignScheduleStep";
import { CampaignReviewStep } from "./steps/CampaignReviewStep";
import { useCreateEmailCampaign } from "@/hooks/useEmailCampaigns";
import { toast } from "sonner";

interface CampaignWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClients: SelectedClient[];
  onComplete: () => void;
}

export interface CampaignData {
  name: string;
  type: 'outreach' | 'follow-up' | 're-engagement' | 'announcement';
  subject: string;
  content: string;
  scheduledAt?: Date;
  sendImmediately: boolean;
  recipients: SelectedClient[];
}

const STEPS = [
  { id: 1, title: 'Recipients', description: 'Review selected contacts' },
  { id: 2, title: 'Campaign Type', description: 'Choose your approach' },
  { id: 3, title: 'Content', description: 'Write your message' },
  { id: 4, title: 'Schedule', description: 'When to send' },
  { id: 5, title: 'Review', description: 'Confirm & launch' },
];

export const CampaignWizard = ({
  open,
  onOpenChange,
  selectedClients,
  onComplete,
}: CampaignWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    type: 'outreach',
    subject: '',
    content: '',
    sendImmediately: true,
    recipients: selectedClients.filter(c => c.email),
  });

  const createCampaign = useCreateEmailCampaign();

  const progress = (currentStep / STEPS.length) * 100;

  const updateCampaignData = (updates: Partial<CampaignData>) => {
    setCampaignData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return campaignData.recipients.length > 0;
      case 2:
        return campaignData.type && campaignData.name.trim().length > 0;
      case 3:
        return campaignData.subject.trim().length > 0 && campaignData.content.trim().length > 0;
      case 4:
        return campaignData.sendImmediately || campaignData.scheduledAt;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleLaunch = async () => {
    try {
      await createCampaign.mutateAsync({
        name: campaignData.name,
        subject: campaignData.subject,
        content: campaignData.content,
        status: campaignData.sendImmediately ? 'sending' : 'scheduled',
        scheduled_at: campaignData.scheduledAt?.toISOString(),
        recipient_count: campaignData.recipients.length,
      });

      toast.success(`Campaign "${campaignData.name}" created successfully!`);
      onComplete();
      onOpenChange(false);
      
      // Reset wizard
      setCurrentStep(1);
      setCampaignData({
        name: '',
        type: 'outreach',
        subject: '',
        content: '',
        sendImmediately: true,
        recipients: [],
      });
    } catch (error) {
      toast.error("Failed to create campaign");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CampaignRecipientsStep
            recipients={campaignData.recipients}
            allSelected={selectedClients}
            onUpdateRecipients={(recipients) => updateCampaignData({ recipients })}
          />
        );
      case 2:
        return (
          <CampaignTypeStep
            type={campaignData.type}
            name={campaignData.name}
            recipientCount={campaignData.recipients.length}
            onUpdateType={(type) => updateCampaignData({ type })}
            onUpdateName={(name) => updateCampaignData({ name })}
          />
        );
      case 3:
        return (
          <CampaignContentStep
            subject={campaignData.subject}
            content={campaignData.content}
            campaignType={campaignData.type}
            onUpdateSubject={(subject) => updateCampaignData({ subject })}
            onUpdateContent={(content) => updateCampaignData({ content })}
          />
        );
      case 4:
        return (
          <CampaignScheduleStep
            sendImmediately={campaignData.sendImmediately}
            scheduledAt={campaignData.scheduledAt}
            onUpdateSendImmediately={(sendImmediately) => updateCampaignData({ sendImmediately })}
            onUpdateScheduledAt={(scheduledAt) => updateCampaignData({ scheduledAt })}
          />
        );
      case 5:
        return (
          <CampaignReviewStep campaignData={campaignData} />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Create Email Campaign
            </DialogTitle>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`text-xs ${
                    step.id === currentStep
                      ? 'text-primary font-medium'
                      : step.id < currentStep
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/50'
                  }`}
                >
                  {step.title}
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-4 min-h-[300px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </div>

          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleLaunch}
              disabled={createCampaign.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4 mr-2" />
              {createCampaign.isPending ? 'Launching...' : 'Launch Campaign'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
