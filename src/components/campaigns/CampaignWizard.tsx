import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Send, Check } from "lucide-react";
import { SelectedClient } from "@/hooks/useClientSelection";
import { CampaignRecipientsStep } from "./steps/CampaignRecipientsStep";
import { CampaignTypeStep } from "./steps/CampaignTypeStep";
import { CampaignContentStep } from "./steps/CampaignContentStep";
import { CampaignScheduleStep } from "./steps/CampaignScheduleStep";
import { CampaignReviewStep } from "./steps/CampaignReviewStep";
import { useCreateEmailCampaign } from "@/hooks/useEmailCampaigns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CampaignWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClients: SelectedClient[];
  onComplete: () => void;
  initialData?: {
    name: string;
    type: CampaignData['type'];
    subject: string;
    content: string;
  };
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
  { id: 1, title: 'Recipients', description: 'Review contacts' },
  { id: 2, title: 'Type', description: 'Choose approach' },
  { id: 3, title: 'Content', description: 'Write message' },
  { id: 4, title: 'Schedule', description: 'When to send' },
  { id: 5, title: 'Review', description: 'Confirm' },
];

export const CampaignWizard = ({
  open,
  onOpenChange,
  selectedClients,
  onComplete,
  initialData,
}: CampaignWizardProps) => {
  const [currentStep, setCurrentStep] = useState(initialData ? 1 : 1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: initialData?.name || '',
    type: initialData?.type || 'outreach',
    subject: initialData?.subject || '',
    content: initialData?.content || '',
    sendImmediately: true,
    recipients: selectedClients.filter(c => c.email),
  });

  // Reset state when dialog opens with initialData
  useEffect(() => {
    if (open) {
      setCampaignData({
        name: initialData?.name || '',
        type: initialData?.type || 'outreach',
        subject: initialData?.subject || '',
        content: initialData?.content || '',
        sendImmediately: true,
        recipients: selectedClients.filter(c => c.email),
      });
      setCurrentStep(1);
    }
  }, [open, initialData, selectedClients]);

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

  const handleStepClick = (stepId: number) => {
    // Only allow clicking on completed steps or current step
    if (stepId < currentStep) {
      setCurrentStep(stepId);
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

      // Close dialog FIRST so toast appears on top
      onOpenChange(false);
      
      // Reset wizard state
      setCurrentStep(1);
      setCampaignData({
        name: '',
        type: 'outreach',
        subject: '',
        content: '',
        sendImmediately: true,
        recipients: [],
      });

      // Show toast AFTER dialog closes (with small delay for animation)
      setTimeout(() => {
        toast.success(`Campaign "${campaignData.name}" created successfully! View it in the Emails tab.`);
        onComplete();
      }, 150);
    } catch (error) {
      console.error("Campaign creation error:", error);
      toast.error("Failed to create campaign. Please try again.");
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
            recipientCount={campaignData.recipients.length}
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header with Progress */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Create Email Campaign
            </DialogTitle>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </span>
          </div>
          
          {/* Enhanced Step Indicators */}
          <div className="space-y-3">
            <Progress value={progress} className="h-1.5" />
            <div className="flex justify-between gap-1">
              {STEPS.map((step) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                const isClickable = step.id < currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all",
                      isClickable && "cursor-pointer hover:bg-muted/50",
                      !isClickable && !isCurrent && "cursor-default opacity-50"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary/20 text-primary border-2 border-primary",
                      !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        "text-xs font-medium",
                        isCurrent ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-[400px]">
          {renderStep()}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-1.5"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleLaunch}
              disabled={createCampaign.isPending}
              className="gap-1.5 bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
              {createCampaign.isPending ? 'Launching...' : 'Launch Campaign'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
