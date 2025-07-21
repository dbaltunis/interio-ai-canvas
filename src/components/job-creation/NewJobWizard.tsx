
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useCreateProject } from "@/hooks/useProjects";
import { useCreateQuote } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewJobWizardProps {
  onBack: () => void;
  initialData: any;
  onDataChange: (data: any) => void;
}

export const NewJobWizard = ({ onBack, initialData, onDataChange }: NewJobWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    status: "draft",
    client_id: null,
    description: "",
    start_date: "",
    due_date: ""
  });

  const { data: clients } = useClients();
  const createProject = useCreateProject();
  const createQuote = useCreateQuote();
  const { toast } = useToast();

  const steps = [
    { id: 1, title: "Job Details", description: "Basic job information" },
    { id: 2, title: "Client", description: "Select or create client" },
    { id: 3, title: "Review", description: "Review and create job" }
  ];

  const updateFormData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateJob = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Job title is required",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get next job number
      const { count } = await supabase
        .from("projects")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);
      
      const jobNumber = String(1000 + (count || 0) + 1);
      
      // Create project
      const newProject = await createProject.mutateAsync({
        name: formData.title,
        description: formData.description,
        status: formData.status as any,
        priority: "medium",
        client_id: formData.client_id,
        job_number: jobNumber,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null
      });
      
      // Create quote
      await createQuote.mutateAsync({
        project_id: newProject.id,
        client_id: formData.client_id,
        status: "draft",
        subtotal: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 0,
        notes: "New job created"
      });
      
      toast({
        title: "Success",
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.id 
                ? 'bg-brand-primary border-brand-primary text-white' 
                : 'border-gray-300 text-gray-500'
            }`}>
              {currentStep > step.id ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>
            <div className="ml-3 text-left">
              <div className={`text-sm font-medium ${
                currentStep >= step.id ? 'text-brand-primary' : 'text-gray-500'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > step.id ? 'bg-brand-primary' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {steps.find(s => s.id === currentStep)?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  placeholder="Enter job title"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => updateFormData("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => updateFormData("start_date", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => updateFormData("due_date", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="Job description (optional)"
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Client (Optional)</Label>
                <Select 
                  value={formData.client_id || ""} 
                  onValueChange={(value) => updateFormData("client_id", value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client or leave empty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No client</SelectItem>
                    {clients?.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-gray-600">
                You can create jobs without a client and assign one later.
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Review Job Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div><strong>Title:</strong> {formData.title}</div>
                <div><strong>Status:</strong> {formData.status}</div>
                <div><strong>Client:</strong> {
                  formData.client_id 
                    ? clients?.find(c => c.id === formData.client_id)?.name 
                    : "No client assigned"
                }</div>
                {formData.start_date && <div><strong>Start Date:</strong> {formData.start_date}</div>}
                {formData.due_date && <div><strong>Due Date:</strong> {formData.due_date}</div>}
                {formData.description && <div><strong>Description:</strong> {formData.description}</div>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={currentStep === 1 ? onBack : handlePrevious}
          disabled={isCreating}
        >
          {currentStep === 1 ? "Cancel" : "Previous"}
        </Button>
        
        <Button 
          onClick={currentStep === steps.length ? handleCreateJob : handleNext}
          disabled={isCreating || (currentStep === 1 && !formData.title.trim())}
          className="bg-brand-primary hover:bg-brand-accent text-white"
        >
          {isCreating ? "Creating..." : currentStep === steps.length ? "Create Job" : "Next"}
        </Button>
      </div>
    </div>
  );
};
