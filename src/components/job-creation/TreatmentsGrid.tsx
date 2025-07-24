
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

interface TreatmentsGridProps {
  projectId: string;
  onCreateTreatment?: () => void;
}

export const TreatmentsGrid = ({ projectId, onCreateTreatment }: TreatmentsGridProps) => {
  // Mock treatments data - replace with actual hook
  const treatments = [
    {
      id: "1",
      product_name: "Silk Curtains",
      treatment_type: "curtains",
      status: "planned",
      total_price: 1200,
      fabric_type: "Silk",
      color: "Ivory"
    },
    {
      id: "2",
      product_name: "Wooden Blinds",
      treatment_type: "blinds", 
      status: "in_progress",
      total_price: 800,
      fabric_type: "Wood",
      color: "Natural"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Treatments</CardTitle>
          {onCreateTreatment && (
            <Button size="sm" onClick={onCreateTreatment}>
              <Plus className="h-4 w-4 mr-2" />
              Add Treatment
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {treatments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No treatments found for this project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {treatments.map((treatment) => (
              <div key={treatment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{treatment.product_name}</h4>
                  <Badge className={getStatusColor(treatment.status)}>
                    {treatment.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{treatment.treatment_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Material:</span>
                    <span>{treatment.fabric_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Color:</span>
                    <span>{treatment.color}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Price:</span>
                    <span>${treatment.total_price.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
