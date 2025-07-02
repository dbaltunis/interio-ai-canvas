import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MakingCostsForm } from "./making-costs/MakingCostsForm";
import { useMakingCosts } from "@/hooks/useMakingCosts";

export const MakingCostsManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCost, setEditingCost] = useState<any>(null);
  const { makingCosts, isLoading, deleteMakingCost } = useMakingCosts();

  const handleEdit = (cost: any) => {
    setEditingCost(cost);
    setIsCreating(true);
  };

  const handleCloseForm = () => {
    setIsCreating(false);
    setEditingCost(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading making costs...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-blue-800">Making Costs Configurations</CardTitle>
                <CardDescription className="text-blue-600">
                  Create complete window covering configurations with bundled options, pricing methods, and automatic calculations
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
              NEW SYSTEM
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <p className="text-sm text-blue-700">
              This replaces manual option selection with pre-configured bundles. Create configurations like "Standard Pleated Curtains" with all options, pricing, and measurements pre-set.
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-800">
              {editingCost ? 'Edit Making Cost Configuration' : 'Create New Making Cost Configuration'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <MakingCostsForm
              initialData={editingCost}
              onSave={handleCloseForm}
              onCancel={handleCloseForm}
            />
          </CardContent>
        </Card>
      )}

      {/* Existing Configurations */}
      <div className="grid gap-4">
        {makingCosts.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Making Cost Configurations</h3>
              <p className="text-gray-500 mb-4">
                Create your first configuration to enable automated calculator setup
              </p>
              <Button onClick={() => setIsCreating(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create First Configuration
              </Button>
            </CardContent>
          </Card>
        ) : (
          makingCosts.map((cost) => (
            <Card key={cost.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{cost.name}</CardTitle>
                      <CardDescription>
                        {cost.pricing_method} • {cost.heading_options?.length || 0} heading options
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={cost.include_fabric_selection ? "default" : "secondary"}>
                      {cost.include_fabric_selection ? "With Fabric" : "No Fabric"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(cost)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMakingCost(cost.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pricing Method</p>
                    <p className="text-sm">{cost.pricing_method}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Measurement</p>
                    <p className="text-sm">{cost.measurement_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Heading Options</p>
                    <p className="text-sm">{cost.heading_options?.length || 0} configured</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hardware Options</p>
                    <p className="text-sm">{cost.hardware_options?.length || 0} configured</p>
                  </div>
                </div>
                
                {/* Preview of heading options */}
                {cost.heading_options && cost.heading_options.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Heading Options:</p>
                    <div className="flex flex-wrap gap-2">
                      {cost.heading_options.slice(0, 3).map((option: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {option.name} ({option.fullness}x)
                        </Badge>
                      ))}
                      {cost.heading_options.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{cost.heading_options.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
