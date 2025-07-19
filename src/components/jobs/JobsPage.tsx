
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
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
        <p className="text-gray-600 mt-2">Manage clients, projects, and communications</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="clients">Clients ({clients.length})</TabsTrigger>
          <TabsTrigger value="emails">Emails ({emails.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-6">
          <EnhancedJobsManagement />
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <ClientManagement />
        </TabsContent>

        <TabsContent value="emails" className="mt-6">
          <EmailManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobsPage;
