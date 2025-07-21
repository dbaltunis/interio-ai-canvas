
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Plus, Send, History, Settings } from "lucide-react";
import { ProjectEmailComposer } from "../email/ProjectEmailComposer";
import { ProjectEmailHistory } from "../email/ProjectEmailHistory";
import { useProjects } from "@/hooks/useProjects";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";

interface EmailsTabProps {
  projectId: string;
}

export const EmailsTab = ({ projectId }: EmailsTabProps) => {
  const [showComposer, setShowComposer] = useState(false);
  const [activeTab, setActiveTab] = useState("history");

  const { data: projects } = useProjects();
  const { hasSendGridIntegration } = useIntegrationStatus();
  
  const project = projects?.find(p => p.id === projectId);

  if (!project) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Project not found</h3>
          <p className="text-gray-500">Unable to load project information.</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasSendGridIntegration) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Email Integration Required</h3>
          <p className="text-gray-500 mb-4">
            Please configure your email integration in Settings to send emails.
          </p>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configure Email
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showComposer) {
    return (
      <ProjectEmailComposer
        projectId={projectId}
        projectName={project.name}
        onClose={() => setShowComposer(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Communication</h2>
          <p className="text-gray-600">
            Manage email communication for: <span className="font-medium">{project.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowComposer(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Compose Email
          </Button>
        </div>
      </div>

      {/* Email Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Email History
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <ProjectEmailHistory projectId={projectId} />
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Email Templates</h3>
                <p className="text-gray-500 mb-4">
                  Create and manage reusable email templates for your projects.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
