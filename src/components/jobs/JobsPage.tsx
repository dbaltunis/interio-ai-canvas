
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClients } from "@/hooks/useClients";
import { useEmails } from "@/hooks/useEmails";
import { ClientManagement } from "./ClientManagement";
import { EmailManagement } from "./EmailManagement";
import { EnhancedJobsManagement } from "./EnhancedJobsManagement";

const JobsPage = () => {
  const [activeTab, setActiveTab] = useState<"clients" | "emails" | "jobs">("jobs");
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: emails = [], isLoading: emailsLoading } = useEmails();

  const handleTabChange = (value: string) => {
    if (value === "clients" || value === "emails" || value === "jobs") {
      setActiveTab(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Job Management
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Manage your projects, clients, and communications
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="border-b bg-muted/30 p-1">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-transparent">
                <TabsTrigger 
                  value="jobs" 
                  className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Jobs
                </TabsTrigger>
                <TabsTrigger 
                  value="clients" 
                  className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <span className="hidden sm:inline">Clients</span>
                  <span className="sm:hidden">Clients</span>
                  <span className="ml-1 text-xs opacity-70">({clients.length})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="emails" 
                  className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <span className="hidden sm:inline">Emails</span>
                  <span className="sm:hidden">Emails</span>
                  <span className="ml-1 text-xs opacity-70">({emails.length})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 sm:p-6">
              <TabsContent value="jobs" className="mt-0 space-y-0">
                <EnhancedJobsManagement />
              </TabsContent>

              <TabsContent value="clients" className="mt-0 space-y-0">
                <ClientManagement />
              </TabsContent>

              <TabsContent value="emails" className="mt-0 space-y-0">
                <EmailManagement />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0 space-y-0">
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Detailed insights and analytics for your jobs and projects will be available here.
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
