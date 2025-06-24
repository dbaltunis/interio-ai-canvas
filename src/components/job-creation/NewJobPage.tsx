
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
  const [activeTab, setActiveTab] = useState("jobs");
  const [currentProject, setCurrentProject] = useState<any>(null);
  
  const { data: clients } = useClients();
  const createProject = useCreateProject();

  // Create a default project immediately when component mounts
  useEffect(() => {
    const createDefaultProject = async () => {
      if (!clients || clients.length === 0) return;
      
      try {
        const defaultClient = clients[0]; // Use first available client
        const newProject = await createProject.mutateAsync({
          name: "New Project",
          description: "",
          client_id: defaultClient.id,
          status: "planning",
          priority: "medium"
        });
        
        setCurrentProject(newProject);
      } catch (error) {
        console.error("Failed to create default project:", error);
      }
    };

    if (!currentProject && clients && clients.length > 0) {
      createDefaultProject();
    }
  }, [clients, currentProject, createProject]);

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
        return <ProjectJobsTab project={currentProject} onBack={onBack} />;
      case "quote":
        return <ProjectQuoteTab project={currentProject} />;
      case "workshop":
        return <ProjectWorkshopTab project={currentProject} />;
      default:
        return <ProjectJobsTab project={currentProject} onBack={onBack} />;
    }
  };

  // Show loading state if no project yet
  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Creating new project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Jobs</span>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold">{currentProject.name}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
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
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Project Navigation Tabs */}
        <div className="flex space-x-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className={`px-6 py-2 rounded-none border-b-2 ${
                  activeTab === item.id
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span>{item.label}</span>
                {item.id === "client" && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
};
