
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Building, Package, Scissors, Wrench, Calendar, Flag } from "lucide-react";
import { useClients } from "@/hooks/useClients";

interface ReviewStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export const ReviewStep = ({ formData }: ReviewStepProps) => {
  const { data: clients } = useClients();
  const selectedClient = clients?.find(c => c.id === formData.client_id);

  const getItemIcon = (type: string) => {
    switch (type) {
      case "fabric": return <Scissors className="h-4 w-4" />;
      case "product": return <Package className="h-4 w-4" />;
      case "service": return <Wrench className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getTotalValue = () => {
    return formData.project_items?.reduce((total: number, item: any) => 
      total + (item.quantity * item.price), 0
    ) || 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Review Job Details</h3>
        <p className="text-sm text-gray-500">
          Please review all information before creating the job.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Status:</span>
              <Badge variant="outline" className="capitalize">
                {formData.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Priority:</span>
              <Badge variant="outline" className="capitalize">
                {formData.priority}
              </Badge>
            </div>
            {formData.start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Start Date:</span>
                <span className="text-sm font-medium">
                  {new Date(formData.start_date).toLocaleDateString()}
                </span>
              </div>
            )}
            {formData.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Due Date:</span>
                <span className="text-sm font-medium">
                  {new Date(formData.due_date).toLocaleDateString()}
                </span>
              </div>
            )}
            {formData.note && (
              <div>
                <span className="text-sm text-gray-500">Note:</span>
                <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                  {formData.note}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedClient ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {selectedClient.client_type === "B2B" ? (
                    <Building className="h-5 w-5 text-gray-400" />
                  ) : (
                    <User className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">{selectedClient.name}</p>
                    {selectedClient.company_name && (
                      <p className="text-sm text-gray-500">{selectedClient.company_name}</p>
                    )}
                  </div>
                </div>
                {selectedClient.email && (
                  <p className="text-sm text-gray-600">{selectedClient.email}</p>
                )}
                {selectedClient.phone && (
                  <p className="text-sm text-gray-600">{selectedClient.phone}</p>
                )}
                {selectedClient.address && (
                  <p className="text-sm text-gray-600">
                    {selectedClient.address}
                    {selectedClient.city && `, ${selectedClient.city}`}
                    {selectedClient.state && `, ${selectedClient.state}`}
                    {selectedClient.zip_code && ` ${selectedClient.zip_code}`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No client assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Items */}
      {formData.project_items && formData.project_items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.project_items.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    {getItemIcon(item.type)}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.unit}
                        {item.supplier && ` • ${item.supplier}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.quantity * item.price).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)} per {item.unit}</p>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Project Value:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${getTotalValue().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
