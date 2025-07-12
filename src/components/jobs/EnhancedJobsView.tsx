
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Edit3, Calculator, FileText, Calendar, DollarSign } from "lucide-react";

interface EnhancedJobsViewProps {
  job: any;
  onEdit: (jobId: string) => void;
  onViewDetails: (jobId: string) => void;
}

export const EnhancedJobsView = ({ job, onEdit, onViewDetails }: EnhancedJobsViewProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => `$${(amount || 0).toFixed(2)}`;
  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString() : 'Not set';

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">
              {job.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Job #{job.job_number || 'N/A'} • Client: {job.client?.name || 'No client'}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(job.status)}>
              {job.status || 'Unknown'}
            </Badge>
            <Badge className={getPriorityColor(job.priority)}>
              {job.priority || 'Medium'} Priority
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="financials" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Financials
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-1">
              <Edit3 className="h-3 w-3" />
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Project Scope</h4>
                  <p className="text-sm text-blue-700">
                    {job.description || 'No description provided'}
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Project Value</h4>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(job.total_amount)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Key Dates</h4>
                  <div className="space-y-1 text-sm text-purple-700">
                    <p>Start: {formatDate(job.start_date)}</p>
                    <p>Due: {formatDate(job.due_date)}</p>
                    {job.completion_date && (
                      <p>Completed: {formatDate(job.completion_date)}</p>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">Current Phase</h4>
                  <p className="text-sm text-orange-700 capitalize">
                    {job.status?.replace('_', ' ') || 'Planning'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Project Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Project Created</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDate(job.created_at)}
                    </span>
                  </div>
                  
                  {job.start_date && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Project Started</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDate(job.start_date)}
                      </span>
                    </div>
                  )}
                  
                  {job.due_date && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Due Date</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDate(job.due_date)}
                      </span>
                    </div>
                  )}
                  
                  {job.completion_date && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-sm">Project Completed</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDate(job.completion_date)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="financials" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Value:</span>
                      <span className="font-medium">{formatCurrency(job.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge variant="outline" className="text-xs">
                        {job.status === 'completed' ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Payment Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Deposit: {formatCurrency((job.total_amount || 0) * 0.3)}</p>
                    <p>Progress: {formatCurrency((job.total_amount || 0) * 0.4)}</p>
                    <p>Final: {formatCurrency((job.total_amount || 0) * 0.3)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="mt-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => onEdit(job.id)} className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Project
              </Button>
              
              <Button variant="outline" onClick={() => onViewDetails(job.id)} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Details
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Recalculate
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generate Quote
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
