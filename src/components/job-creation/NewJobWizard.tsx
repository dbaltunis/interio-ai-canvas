
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useCreateProject } from "@/hooks/useProjects";
import { useCreateQuote } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JobDetailsStep } from "./steps/JobDetailsStep";
import { ClientSearchStep } from "./steps/ClientSearchStep";
import { ProjectItemsStep } from "./steps/ProjectItemsStep";
import { ReviewStep } from "./steps/ReviewStep";

interface NewJobWizardProps {
  onBack: () => void;
  initialData: any;
  onDataChange: (data: any) => void;
}

export const NewJobWizard = ({ onBack, initialData, onDataChange }: NewJobWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    status: "draft",
    priority: "medium",
    client_id: null,
    note: "",
    start_date: "",
    due_date: "",
    project_items: []
  });

  const createProject = useCreateProject();
  const createQuote = useCreateQuote();
  const { toast } = useToast();

  const steps = [
    { 
      id: 1, 
      title: "Job Details", 
      description: "Set status, priority, and dates",
      component: JobDetailsStep
    },
    { 
      id: 2, 
      title: "Client", 
      description: "Search or create client",
      component: ClientSearchStep
    },
    { 
      id: 3, 
      title: "Project Items", 
      description: "Add fabrics, products, services",
      component: ProjectItemsStep
    },
    { 
      id: 4, 
      title: "Review & Create", 
      description: "Confirm and create job",
      component: ReviewStep
    }
  ];

  const updateFormData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return true; // No required fields in step 1
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateJobNumber = async (userId: string) => {
    const { count } = await supabase
      .from("projects")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId);
    
    return String(count + 1).padStart(3, '0');
  };

  const handleCreateJob = async () => {
    setIsCreating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const jobNumber = await generateJobNumber(user.id);
      
      // Calculate total from project items
      const totalAmount = formData.project_items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.price), 0
      );

      // Create project
      const newProject = await createProject.mutateAsync({
        name: `Job #${jobNumber}`,
        description: formData.note || null,
        status: formData.status as any,
        priority: formData.priority as any,
        client_id: formData.client_id,
        job_number: jobNumber,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        total_amount: totalAmount
      });
      
      // Create initial quote if there are items
      if (formData.project_items.length > 0) {
        await createQuote.mutateAsync({
          project_id: newProject.id,
          client_id: formData.client_id,
          status: "draft",
          subtotal: totalAmount,
          tax_rate: 0,
          tax_amount: 0,
          total_amount: totalAmount,
          notes: `Initial quote for Job #${jobNumber} with ${formData.project_items.length} items`
        });
      }
      
      toast({
        title: "Success!",
        description: `Job #${jobNumber} created successfully`,
      });
      
      onBack();
    } catch (error) {
      console.error("Failed to create job:", error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const currentStepData = steps.find(s => s.id === currentStep);
  const StepComponent = currentStepData?.component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
              currentStep >= step.id 
                ? 'bg-brand-primary border-brand-primary text-white' 
                : 'border-gray-300 text-gray-500 bg-white'
            }`}>
              {currentStep > step.id ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>
            <div className="ml-3 text-left">
              <div className={`text-sm font-medium transition-colors duration-200 ${
                currentStep >= step.id ? 'text-brand-primary' : 'text-gray-500'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 transition-colors duration-200 ${
                currentStep > step.id ? 'bg-brand-primary' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-900">
            {currentStepData?.title}
          </CardTitle>
          <p className="text-sm text-gray-600">{currentStepData?.description}</p>
        </CardHeader>
        <CardContent>
          {StepComponent && (
            <StepComponent 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={currentStep === 1 ? onBack : handlePrevious}
          disabled={isCreating}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{currentStep === 1 ? "Cancel" : "Previous"}</span>
        </Button>
        
        <Button 
          onClick={currentStep === steps.length ? handleCreateJob : handleNext}
          disabled={isCreating || !canProceed()}
          className="bg-brand-primary hover:bg-brand-accent text-white flex items-center space-x-2"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating Job...</span>
            </>
          ) : currentStep === steps.length ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Create Job</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
