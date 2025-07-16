
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, User, Calendar, DollarSign, FileText } from "lucide-react";
import { JobStatusBadge } from "./JobStatusBadge";

interface JobGridViewProps {
  jobs: any[];
  onJobView: (jobId: string) => void;
  onJobEdit: (jobId: string) => void;
}

export const JobGridView = ({ jobs, onJobView, onJobEdit }: JobGridViewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <Card 
          key={job.id} 
          className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-brand-secondary cursor-pointer"
          onClick={() => onJobView(job.id)}
        >
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {job.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-3 w-3" />
                  {job.job_number}
                </div>
              </div>
              <JobStatusBadge status={job.status} />
            </div>

            {/* Description */}
            {job.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {job.description}
              </p>
            )}

            {/* Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {job.client?.name || 'No client assigned'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {job.total_amount ? formatCurrency(job.total_amount) : 'TBD'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'No date'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onJobView(job.id);
                }}
                className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onJobEdit(job.id);
                }}
                className="flex-1 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
