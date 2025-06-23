
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Briefcase, FileText, Wrench, Calendar } from "lucide-react";
import { useCreateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { ProjectJobsTab } from "./ProjectJobsTab";
import { ProjectClientTab } from "./ProjectClientTab";
import { ProjectQuoteTab } from "./ProjectQuoteTab";
import { ProjectWorkshopTab } from "./ProjectWorkshopTab";

interface NewJobPageProps {
  onBack: () => void;
}

export const NewJobPage = ({ onBack }: NewJobPageProps) => {
  const [activeTab, setActiveTab] = useState("client");
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  // Form state for new project
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  const { data: clients } = useClients();
  const createProject = useCreateProject();

  const handleCreateProject = async () => {
    if (!projectName || !selectedClientId) return;

    setIsCreatingProject(true);
    try {
      const newProject = await createProject.mutateAsync({
        name: projectName,
        description: projectDescription,
        client_id: selectedClientId,
        status: "planning",
        priority: "medium"
      });
      
      setCurrentProject(newProject);
      setActiveTab("jobs");
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const navItems = [
    { id: "client", label: "Client", icon: User },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "quote", label: "Quote", icon: FileText },
    { id: "workshop", label: "Workshop", icon: Wrench },
  ];

  const renderTabContent = () => {
    if (!currentProject) return null;

    switch (activeTab) {
      case "client":
        return <ProjectClientTab project={currentProject} />;
      case "jobs":
        return <ProjectJobsTab project={currentProject} />;
      case "quote":
        return <ProjectQuoteTab project={currentProject} />;
      case "workshop":
        return <ProjectWorkshopTab project={currentProject} />;
      default:
        return <ProjectJobsTab project={currentProject} />;
    }
  };

  if (!currentProject) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create New Job</h2>
            <p className="text-muted-foreground">Start a new project by selecting a client and providing project details</p>
          </div>
        </div>

        {/* Project Creation Form */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Fill in the basic information for your new project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Select Client *</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.phone && `- ${client.phone}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe the project..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProject}
                disabled={!projectName || !selectedClientId || isCreatingProject}
              >
                {isCreatingProject ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{currentProject.name}</h2>
            <p className="text-muted-foreground">{currentProject.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Select defaultValue="payment">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="quote">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quote">Quote</SelectItem>
              <SelectItem value="order">Order</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project Navigation Tabs */}
      <div className="border-b">
        <nav className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`flex items-center space-x-2 px-4 py-2 ${
                  activeTab === item.id ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.id === "client" && <span className="text-red-500">🔴</span>}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
};
