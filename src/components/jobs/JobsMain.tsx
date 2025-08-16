
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3, FileText, Calendar, TrendingUp, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobsDashboard } from "./JobsDashboard";
import { SimplifiedJobsDashboard } from "./SimplifiedJobsDashboard";
import { JobsAnalytics } from "./JobsAnalytics";
import { JobsPerformanceMetrics } from "./JobsPerformanceMetrics";
import { JobDetailPage } from "./JobDetailPage";
import { JobsListWithQuotes } from "./JobsListWithQuotes";
import { QuoteVersionManager } from "./QuoteVersionManager";

interface JobsMainProps {
  onCreateJob: () => void;
}

export const JobsMain = ({ onCreateJob }: JobsMainProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showQuoteManager, setShowQuoteManager] = useState(false);
  const [selectedProjectForQuote, setSelectedProjectForQuote] = useState<string | null>(null);

  // If showing quote manager
  if (showQuoteManager && selectedProjectForQuote) {
    return (
      <div className="min-h-screen bg-background">
        <div className="liquid-glass rounded-xl p-6">
          <QuoteVersionManager
            projectId={selectedProjectForQuote}
            onSave={(config) => {
              console.log('Saving quote config:', config);
              setShowQuoteManager(false);
              setSelectedProjectForQuote(null);
            }}
            onCancel={() => {
              setShowQuoteManager(false);
              setSelectedProjectForQuote(null);
            }}
            onPreview={() => {
              console.log('Preview quote');
            }}
          />
        </div>
      </div>
    );
  }

  // If a job is selected, show the job detail page
  if (selectedJobId) {
    return (
      <JobDetailPage 
        jobId={selectedJobId} 
        onBack={() => setSelectedJobId(null)} 
      />
    );
  }

  const handleCreateQuoteVersion = (projectId: string) => {
    setSelectedProjectForQuote(projectId);
    setShowQuoteManager(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="liquid-glass rounded-xl p-6 space-y-6">
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
            <SimplifiedJobsDashboard />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <JobsListWithQuotes 
              onJobSelect={setSelectedJobId}
              onCreateQuoteVersion={handleCreateQuoteVersion}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
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
