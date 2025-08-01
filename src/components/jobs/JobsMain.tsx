
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3, FileText, Calendar, TrendingUp } from "lucide-react";
import { JobsDashboard } from "./JobsDashboard";
import { JobsAnalytics } from "./JobsAnalytics";
import { JobsPerformanceMetrics } from "./JobsPerformanceMetrics";
import { JobDetailPage } from "./JobDetailPage";
import { JobsTableView } from "./JobsTableView";

interface JobsMainProps {
  onCreateJob: () => void;
}

export const JobsMain = ({ onCreateJob }: JobsMainProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // If a job is selected, show the job detail page
  if (selectedJobId) {
    return (
      <JobDetailPage 
        jobId={selectedJobId} 
        onBack={() => setSelectedJobId(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">Jobs Management</h1>
          </div>
          <Button 
            onClick={onCreateJob}
            className="flex items-center space-x-2 bg-brand-primary hover:bg-brand-accent text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Job</span>
          </Button>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>All Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Performance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <JobsDashboard />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsTableView 
              onJobSelect={setSelectedJobId} 
              searchTerm=""
              statusFilter="all"
            />
          </TabsContent>

          <TabsContent value="analytics">
            <JobsAnalytics />
          </TabsContent>

          <TabsContent value="performance">
            <JobsPerformanceMetrics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
