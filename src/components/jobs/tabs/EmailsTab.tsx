
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Plus, Send, History, Settings, Sparkles, MessageCircle, FileText, Clock } from "lucide-react";
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
      <div className="bg-white rounded-xl shadow-sm border-0 p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-brand-secondary/20 rounded-full flex items-center justify-center mx-auto">
            <Mail className="h-8 w-8 text-brand-primary" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Oops! Project not found</h3>
          <p className="text-gray-500">We couldn't find this project.</p>
        </div>
      </div>
    );
  }

  if (!hasSendGridIntegration) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-0 p-8">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-brand-accent/20 rounded-full flex items-center justify-center mx-auto">
            <Settings className="h-10 w-10 text-brand-accent" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Connect Your Email</h3>
            <p className="text-gray-500">
              Ready to start sending emails? Let's get you connected!
            </p>
          </div>
          <Button className="bg-brand-accent hover:bg-brand-accent/90 text-white px-6 py-2 rounded-lg shadow-md">
            <Sparkles className="h-4 w-4 mr-2" />
            Set Up Email
          </Button>
        </div>
      </div>
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
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Email Communications</h2>
        </div>
        <Button 
          onClick={() => setShowComposer(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Message
        </Button>
      </div>

      {/* Clean Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="history" className="text-sm">
            Recent Emails
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-sm">
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <ProjectEmailHistory projectId={projectId} />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Message Templates</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Save time with reusable message templates for common communications.
              </p>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
