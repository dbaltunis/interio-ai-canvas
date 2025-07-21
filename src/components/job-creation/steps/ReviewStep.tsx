
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, User, FileText } from "lucide-react";
import { useClients } from "@/hooks/useClients";

interface ReviewStepProps {
  formData: any;
}

export const ReviewStep = ({ formData }: ReviewStepProps) => {
  const { data: clients } = useClients();
  const selectedClient = formData.client_id ? clients?.find(c => c.id === formData.client_id) : null;

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      planning: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-purple-100 text-purple-800"
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Review Job Details</h3>
        <p className="text-sm text-gray-500">
          Please review the information below before creating your job
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Job Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Title:</span>
              <p className="text-sm text-gray-900">{formData.title || "Untitled Job"}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <Badge className={`ml-2 ${getStatusColor(formData.status || "draft")}`}>
                  {(formData.status || "draft").charAt(0).toUpperCase() + (formData.status || "draft").slice(1)}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Priority:</span>
                <Badge className={`ml-2 ${getPriorityColor(formData.priority || "medium")}`}>
                  {(formData.priority || "medium").charAt(0).toUpperCase() + (formData.priority || "medium").slice(1)}
                </Badge>
              </div>
            </div>

            {formData.description && (
              <div>
                <span className="text-sm font-medium text-gray-600">Description:</span>
                <p className="text-sm text-gray-900 mt-1">{formData.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client & Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Client & Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Client:</span>
              <p className="text-sm text-gray-900">
                {selectedClient ? (
                  <span className="flex items-center space-x-2">
                    <span>{selectedClient.name}</span>
                    {selectedClient.company_name && (
                      <span className="text-xs text-gray-500">({selectedClient.company_name})</span>
                    )}
                  </span>
                ) : (
                  <span className="text-gray-500 italic">No client assigned</span>
                )}
              </p>
            </div>

            {(formData.start_date || formData.due_date) && (
              <div className="space-y-2">
                {formData.start_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Start:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(formData.start_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {formData.due_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Due:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(formData.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900">What happens next?</h4>
              <p className="text-sm text-blue-700 mt-1">
                After creating this job, you'll be able to add rooms, treatments, create quotes, 
                and manage the project through completion. You can also assign or change the client at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
