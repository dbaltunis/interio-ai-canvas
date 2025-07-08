
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProjectTypeSelector } from "./ProjectTypeSelector";
import { useCreateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

interface ProjectType {
  id: string;
  name: string;
  description: string;
  features: string[];
  workflow: string[];
}

interface EnhancedProjectCreationProps {
  onSuccess: (project: any) => void;
  onCancel: () => void;
}

export const EnhancedProjectCreation = ({ onSuccess, onCancel }: EnhancedProjectCreationProps) => {
  const [step, setStep] = useState<"type" | "details">("type");
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client_id: "",
    priority: "medium" as const,
    project_type: "",
    estimated_value: "",
    target_completion: "",
  });

  const { data: clients } = useClients();
  const createProject = useCreateProject();
  const { toast } = useToast();

  const handleTypeSelect = (type: ProjectType) => {
    setSelectedType(type);
    setFormData(prev => ({ ...prev, project_type: type.id }));
    setStep("details");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateProject = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        client_id: formData.client_id || null,
        priority: formData.priority,
        status: "planning" as const,
        // Store the project type in description or a custom field
        project_type: selectedType?.id,
        total_amount: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        due_date: formData.target_completion || null,
      };

      const newProject = await createProject.mutateAsync(projectData);
      
      toast({
        title: "Success",
        description: `${selectedType?.name || "Project"} created successfully`,
      });
      
      onSuccess(newProject);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (step === "type") {
    return (
      <ProjectTypeSelector 
        onSelectType={handleTypeSelect}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep("type")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Type Selection</span>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Create {selectedType?.name}</h2>
          <p className="text-muted-foreground">{selectedType?.description}</p>
        </div>
      </div>

      {/* Selected Type Overview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Selected Project Type</h3>
              <p className="text-sm text-muted-foreground">{selectedType?.name}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedType?.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details Form */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={`Enter ${selectedType?.name.toLowerCase()} name`}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Project description..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select value={formData.client_id} onValueChange={(value) => handleInputChange('client_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.client_type === 'B2B' ? client.company_name : client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
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
              <Label htmlFor="estimated_value">Estimated Value</Label>
              <Input
                id="estimated_value"
                type="number"
                step="0.01"
                value={formData.estimated_value}
                onChange={(e) => handleInputChange('estimated_value', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_completion">Target Completion</Label>
              <Input
                id="target_completion"
                type="date"
                value={formData.target_completion}
                onChange={(e) => handleInputChange('target_completion', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Expected Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {selectedType?.workflow.map((step, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <span className="text-sm">{step}</span>
                {index < selectedType.workflow.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleCreateProject}
          disabled={isCreating || !formData.name.trim()}
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creating...
            </>
          ) : (
            `Create ${selectedType?.name}`
          )}
        </Button>
      </div>
    </div>
  );
};
