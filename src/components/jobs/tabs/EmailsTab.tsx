
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-xl p-6 shadow-sm border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
              <p className="text-gray-600">
                for <span className="font-medium text-brand-primary">{project.name}</span>
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setShowComposer(true)}
            className="bg-brand-secondary hover:bg-brand-secondary/90 text-white px-4 py-2 rounded-lg shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-gray-50 px-6 py-4">
            <TabsList className="bg-white rounded-lg p-1 shadow-sm">
              <TabsTrigger 
                value="history" 
                className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Recent</span>
              </TabsTrigger>
              <TabsTrigger 
                value="templates" 
                className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-brand-accent data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Templates</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="history" className="mt-0">
              <ProjectEmailHistory projectId={projectId} />
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <div className="text-center py-16 space-y-6">
                <div className="w-20 h-20 bg-brand-accent/20 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-10 w-10 text-brand-accent" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">Message Templates</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Save time with reusable message templates for common communications.
                  </p>
                </div>
                <Button className="bg-brand-accent hover:bg-brand-accent/90 text-white px-6 py-2 rounded-lg shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
