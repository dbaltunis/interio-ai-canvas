import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useProjects, useCreateProject } from "@/hooks/useProjects";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { Building2, User, Plus, ArrowRight, CheckCircle } from "lucide-react";

interface ProjectCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectId: string) => void;
}

export const ProjectCreationWizard = ({ isOpen, onClose, onProjectCreated }: ProjectCreationWizardProps) => {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    client_id: "",
    start_date: "",
    due_date: "",
    priority: "medium" as const,
  });
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    client_type: "B2C" as "B2C" | "B2B",
    company_name: "",
    contact_person: "",
  });
  const [useExistingClient, setUseExistingClient] = useState(true);

  const { toast } = useToast();
  const { data: projects } = useProjects();
  const createProject = useCreateProject();
  const { data: clients } = useClients();
  const createClient = useCreateClient();

  const handleNext = () => {
    if (step === 1 && !useExistingClient) {
      // Validate client data
      if (!clientData.name || !clientData.email) {
        toast({
          title: "Missing Information",
          description: "Please fill in client name and email",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (step === 2) {
      // Validate project data
      if (!projectData.name) {
        toast({
          title: "Missing Information",
          description: "Please enter a project name",
          variant: "destructive",
        });
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handleCreateProject = async () => {
    try {
      let clientId = projectData.client_id;

      // Create new client if needed
      if (!useExistingClient) {
        const newClient = await createClient.mutateAsync(clientData);
        clientId = newClient.id;
      }

      // Create project
      const project = await createProject.mutateAsync({
        ...projectData,
        client_id: clientId,
      });

      toast({
        title: "Success!",
        description: "Project created successfully. You can now add rooms and treatments.",
      });

      onProjectCreated(project.id);
      onClose();
      
      // Reset form
      setStep(1);
      setProjectData({
        name: "",
        description: "",
        client_id: "",
        start_date: "",
        due_date: "",
        priority: "medium",
      });
      setClientData({
        name: "",
        email: "",
        phone: "",
        address: "",
        client_type: "B2C",
        company_name: "",
        contact_person: "",
      });
      setUseExistingClient(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Choose Client</h3>
        <Badge variant="outline">Step 1 of 3</Badge>
      </div>

      <div className="flex gap-4">
        <Card 
          className={`flex-1 cursor-pointer border-2 ${useExistingClient ? 'border-primary' : 'border-border'}`}
          onClick={() => setUseExistingClient(true)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2" />
              Existing Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Select from your client list</p>
          </CardContent>
        </Card>

        <Card 
          className={`flex-1 cursor-pointer border-2 ${!useExistingClient ? 'border-primary' : 'border-border'}`}
          onClick={() => setUseExistingClient(false)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm">
              <Plus className="h-4 w-4 mr-2" />
              New Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Create a new client profile</p>
          </CardContent>
        </Card>
      </div>

      {useExistingClient ? (
        <div className="space-y-4">
          <Label>Select Client</Label>
          <Select value={projectData.client_id} onValueChange={(value) => setProjectData({...projectData, client_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a client" />
            </SelectTrigger>
            <SelectContent>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  <div className="flex items-center space-x-2">
                    {client.client_type === 'B2B' ? (
                      <Building2 className="h-4 w-4 text-blue-600" />
                    ) : (
                      <User className="h-4 w-4 text-purple-600" />
                    )}
                    <span>{client.client_type === 'B2B' ? client.company_name : client.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Card 
              className={`flex-1 cursor-pointer border-2 ${clientData.client_type === 'B2C' ? 'border-primary' : 'border-border'}`}
              onClick={() => setClientData({...clientData, client_type: 'B2C'})}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2" />
                  Individual
                </CardTitle>
              </CardHeader>
            </Card>
            <Card 
              className={`flex-1 cursor-pointer border-2 ${clientData.client_type === 'B2B' ? 'border-primary' : 'border-border'}`}
              onClick={() => setClientData({...clientData, client_type: 'B2B'})}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-sm">
                  <Building2 className="h-4 w-4 mr-2" />
                  Business
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {clientData.client_type === 'B2B' ? (
              <>
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={clientData.company_name}
                    onChange={(e) => setClientData({...clientData, company_name: e.target.value})}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label>Contact Person *</Label>
                  <Input
                    value={clientData.contact_person}
                    onChange={(e) => setClientData({...clientData, contact_person: e.target.value})}
                    placeholder="Contact person name"
                  />
                </div>
              </>
            ) : (
              <div className="col-span-2">
                <Label>Client Name *</Label>
                <Input
                  value={clientData.name}
                  onChange={(e) => setClientData({...clientData, name: e.target.value})}
                  placeholder="Full name"
                />
              </div>
            )}
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={clientData.email}
                onChange={(e) => setClientData({...clientData, email: e.target.value})}
                placeholder="Email address"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={clientData.phone}
                onChange={(e) => setClientData({...clientData, phone: e.target.value})}
                placeholder="Phone number"
              />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Textarea
              value={clientData.address}
              onChange={(e) => setClientData({...clientData, address: e.target.value})}
              placeholder="Client address"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Details</h3>
        <Badge variant="outline">Step 2 of 3</Badge>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Project Name *</Label>
          <Input
            value={projectData.name}
            onChange={(e) => setProjectData({...projectData, name: e.target.value})}
            placeholder="e.g., Living Room Curtains & Blinds"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={projectData.description}
            onChange={(e) => setProjectData({...projectData, description: e.target.value})}
            placeholder="Brief description of the project"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={projectData.start_date}
              onChange={(e) => setProjectData({...projectData, start_date: e.target.value})}
            />
          </div>
          <div>
            <Label>Due Date</Label>
            <Input
              type="date"
              value={projectData.due_date}
              onChange={(e) => setProjectData({...projectData, due_date: e.target.value})}
            />
          </div>
        </div>

        <div>
          <Label>Priority</Label>
          <Select value={projectData.priority} onValueChange={(value: any) => setProjectData({...projectData, priority: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Review & Create</h3>
        <Badge variant="outline">Step 3 of 3</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Project Name:</span>
            <span className="text-sm font-medium">{projectData.name}</span>
          </div>
          {projectData.description && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Description:</span>
              <span className="text-sm font-medium">{projectData.description}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Priority:</span>
            <Badge variant="outline">{projectData.priority.toUpperCase()}</Badge>
          </div>
          {(projectData.start_date || projectData.due_date) && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Timeline:</span>
              <span className="text-sm font-medium">
                {projectData.start_date} {projectData.due_date && `→ ${projectData.due_date}`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Ready to Create Project</p>
              <p className="text-xs text-green-600">You'll be able to add rooms, windows, and treatments after creation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {step < 3 ? (
            <Button onClick={handleNext} disabled={
              (step === 1 && useExistingClient && !projectData.client_id) ||
              (step === 1 && !useExistingClient && (!clientData.name || !clientData.email)) ||
              (step === 2 && !projectData.name)
            }>
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleCreateProject}
              disabled={createProject.isPending || createClient.isPending}
            >
              {(createProject.isPending || createClient.isPending) ? 'Creating...' : 'Create Project'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};