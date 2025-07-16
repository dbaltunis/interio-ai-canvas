
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, User, Calendar, DollarSign, FileText } from "lucide-react";
import { JobStatusBadge } from "./JobStatusBadge";

interface JobListViewProps {
  jobs: any[];
  onJobView: (jobId: string) => void;
  onJobEdit: (jobId: string) => void;
}

export const JobListView = ({ jobs, onJobView, onJobEdit }: JobListViewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <Card 
          key={job.id} 
          className="hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-brand-secondary cursor-pointer"
          onClick={() => onJobView(job.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {/* Left side - Job Info */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                {/* Job Details */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">{job.name}</h3>
                    <JobStatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileText className="h-3 w-3" />
                    {job.job_number}
                  </div>
                  {job.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {job.description}
                    </p>
                  )}
                </div>

                {/* Client */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {job.client?.name || 'No client'}
                  </span>
                </div>

                {/* Value */}
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {job.total_amount ? formatCurrency(job.total_amount) : 'TBD'}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'No date'}
                  </span>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJobView(job.id);
                  }}
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJobEdit(job.id);
                  }}
                  className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
