import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight,
  User,
  Briefcase,
  Home,
  Calculator,
  FileText,
  CheckCircle
} from "lucide-react";
import { ClientSelectionStep } from "./workflow-steps/ClientSelectionStep";
import { ProjectSetupStep } from "./workflow-steps/ProjectSetupStep";
import { RoomMappingStep } from "./workflow-steps/RoomMappingStep";
import { QuoteGenerationStep } from "./workflow-steps/QuoteGenerationStep";
import { useToast } from "@/hooks/use-toast";

interface JobWorkflowPageProps {
  onBack: () => void;
  jobId?: string | null;
}

type WorkflowStep = 
  | "client-selection"
  | "project-setup" 
  | "room-mapping"
  | "quote-generation";

interface WorkflowData {
  client?: any;
  project?: any;
  rooms?: any[];
  treatments?: any[];
}

export const JobWorkflowPage = ({ onBack, jobId }: JobWorkflowPageProps) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("client-selection");
  const [workflowData, setWorkflowData] = useState<WorkflowData>({});
  const [isEditMode] = useState(!!jobId);
  const { toast } = useToast();

  const steps = [
    { 
      id: "client-selection" as const, 
      label: "Client Info", 
      icon: User,
      description: "Select or create client"
    },
    { 
      id: "project-setup" as const, 
      label: "Project Setup", 
      icon: Briefcase,
      description: "Basic project details"
    },
    { 
      id: "room-mapping" as const, 
      label: "Rooms & Windows", 
      icon: Home,
      description: "Add rooms and treatments"
    },
    { 
      id: "quote-generation" as const, 
      label: "Generate Quote", 
      icon: FileText,
      description: "Create professional quote"
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const canProceedToNext = () => {
    switch (currentStep) {
      case "client-selection":
        return !!workflowData.client;
      case "project-setup":
        return !!workflowData.project;
      case "room-mapping":
        return workflowData.rooms && workflowData.rooms.length > 0;
      case "quote-generation":
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleStepClick = (stepId: WorkflowStep) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    
    // Only allow going to previous steps or current step
    if (stepIndex <= currentIndex) {
      setCurrentStep(stepId);
    }
  };

  const updateWorkflowData = (data: Partial<WorkflowData>) => {
    setWorkflowData(prev => ({ ...prev, ...data }));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "client-selection":
        return (
          <ClientSelectionStep
            selectedClient={workflowData.client}
            onClientSelect={(client) => updateWorkflowData({ client })}
          />
        );
      case "project-setup":
        return (
          <ProjectSetupStep
            client={workflowData.client}
            project={workflowData.project}
            onProjectUpdate={(project) => updateWorkflowData({ project })}
          />
        );
      case "room-mapping":
        return (
          <RoomMappingStep
            project={workflowData.project}
            rooms={workflowData.rooms || []}
            treatments={workflowData.treatments || []}
            onRoomsUpdate={(rooms) => updateWorkflowData({ rooms })}
            onTreatmentsUpdate={(treatments) => updateWorkflowData({ treatments })}
          />
        );
      case "quote-generation":
        return (
          <QuoteGenerationStep
            workflowData={workflowData}
            onComplete={() => {
              toast({
                title: "Quote Generated",
                description: "Your quote has been created successfully!",
              });
              onBack();
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-brand-primary">
              {isEditMode ? "Edit Job" : "New Job Workflow"}
            </h1>
            <p className="text-brand-neutral">
              {steps[currentStepIndex].description}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-500">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            
            {/* Step Navigation */}
            <div className="flex items-center justify-between mt-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = index < currentStepIndex;
                const isAccessible = index <= currentStepIndex;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => isAccessible && handleStepClick(step.id)}
                    disabled={!isAccessible}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                      isActive 
                        ? "bg-brand-primary text-white" 
                        : isCompleted
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : isAccessible
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-gray-50 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <div className="relative">
                      <Icon className="h-5 w-5" />
                      {isCompleted && (
                        <CheckCircle className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-center">
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <div className="min-h-[400px]">
        {renderCurrentStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          {currentStep !== "quote-generation" && (
            <Button
              onClick={handleNext}
              disabled={!canProceedToNext()}
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-accent"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};