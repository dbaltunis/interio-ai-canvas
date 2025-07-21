import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useEmails } from "@/hooks/useEmails";
import { ClientManagement } from "./ClientManagement";
import { EmailManagement } from "./EmailManagement";
import { JobsTableView } from "./JobsTableView";
import { NewJobPageSimplified } from "../job-creation/NewJobPageSimplified";

const JobsPage = () => {
  const [activeTab, setActiveTab] = useState<"jobs" | "clients" | "emails" | "analytics">("jobs");
  const [showNewJobPage, setShowNewJobPage] = useState(false);
  const { data: clients = [] } = useClients();
  const { data: emails = [] } = useEmails();

  const handleTabChange = (value: string) => {
    if (value === "clients" || value === "emails" || value === "jobs" || value === "analytics") {
      setActiveTab(value);
    }
  };

  const handleNewJob = () => {
    setShowNewJobPage(true);
  };

  const handleBackFromNewJob = () => {
    setShowNewJobPage(false);
  };

  if (showNewJobPage) {
    return <NewJobPageSimplified onBack={handleBackFromNewJob} />;
  }

  return (
    <div className="min-h-screen bg-white w-full">
      <div className="w-full px-6 py-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">
              Jobs Management
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage your projects, clients, and communications
            </p>
          </div>
          <Button 
            onClick={handleNewJob}
            className="bg-brand-primary hover:bg-brand-accent text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>

        {/* Tabs Section */}
        <div className="bg-white border border-gray-200 rounded-lg w-full">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="border-b bg-gray-50 px-4 py-2">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="jobs" 
                  className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary rounded-none"
                >
                  Jobs (4)
                </TabsTrigger>
                <TabsTrigger 
                  value="clients" 
                  className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary rounded-none"
                >
                  Clients ({clients.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="emails" 
                  className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary rounded-none"
                >
                  Emails ({emails.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary rounded-none"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="jobs" className="mt-0 space-y-0">
                <JobsTableView />
              </TabsContent>

              <TabsContent value="clients" className="mt-0 space-y-0">
                <ClientManagement />
              </TabsContent>

              <TabsContent value="emails" className="mt-0 space-y-0">
                <EmailManagement />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0 space-y-0">
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600 text-sm max-w-sm mx-auto">
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
