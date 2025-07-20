
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Wrench, Clock, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTreatmentTypes, useCreateTreatmentType, useDeleteTreatmentType } from "@/hooks/useTreatmentTypes";

export const TreatmentTypesTab = () => {
  const { toast } = useToast();

  const { data: treatmentTypes = [], isLoading } = useTreatmentTypes();
  const createTreatmentType = useCreateTreatmentType();
  const deleteTreatmentType = useDeleteTreatmentType();

  const [newTreatment, setNewTreatment] = useState({
    name: "",
    category: "",
    description: "",
    estimated_hours: 0,
    complexity: "Medium" as "Low" | "Medium" | "High",
    labor_rate: 85,
    required_materials: [] as string[],
  });

  const handleCreateTreatment = async () => {
    if (!newTreatment.name || !newTreatment.category) {
      toast({
        title: "Error",
        description: "Please fill in name and category",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTreatmentType.mutateAsync({
        name: newTreatment.name,
        category: newTreatment.category,
        description: newTreatment.description,
        estimated_hours: newTreatment.estimated_hours,
        complexity: newTreatment.complexity,
        labor_rate: newTreatment.labor_rate,
        required_materials: newTreatment.required_materials,
        user_id: 'current-user', // Would be actual user ID
      });
      
      setNewTreatment({
        name: "",
        category: "",
        description: "",
        estimated_hours: 0,
        complexity: "Medium",
        labor_rate: 85,
        required_materials: [],
      });
      
      toast({
        title: "Success",
        description: "Treatment type created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create treatment type",
        variant: "destructive",
      });
    }
  };

  const handleMaterialsChange = (materialsString: string) => {
    const materials = materialsString.split(",").map(m => m.trim()).filter(m => m);
    setNewTreatment({ ...newTreatment, required_materials: materials });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Treatment Types</h3>
          <p className="text-sm text-brand-neutral">Configure standard treatments and their labor requirements</p>
        </div>
      </div>

      {/* Treatment Types List */}
      <div className="grid gap-4">
        {treatmentTypes.map((treatment) => (
          <Card key={treatment.id} className="border-brand-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h4 className="text-lg font-semibold text-brand-primary">{treatment.name}</h4>
                    <Badge variant="outline">{treatment.category}</Badge>
                    <Badge 
                      variant={treatment.complexity === 'High' ? 'destructive' : treatment.complexity === 'Medium' ? 'default' : 'secondary'}
                    >
                      {treatment.complexity}
                    </Badge>
                  </div>
                  <p className="text-sm text-brand-neutral mb-4">{treatment.description || "No description"}</p>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-brand-neutral" />
                        <span className="font-medium text-sm">Labor Details</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div><span className="font-medium">Hours:</span> {treatment.estimated_hours || 0}</div>
                        <div><span className="font-medium">Rate:</span> ${treatment.labor_rate || 0}/hr</div>
                        <div><span className="font-medium">Total:</span> ${((treatment.estimated_hours || 0) * (treatment.labor_rate || 0)).toFixed(2)}</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="h-4 w-4 text-brand-neutral" />
                        <span className="font-medium text-sm">Required Materials</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(treatment.required_materials) && treatment.required_materials.map((material: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteTreatmentType.mutate(treatment.id)}
                        disabled={deleteTreatmentType.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Treatment Type */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Treatment Type</CardTitle>
          <CardDescription>Define a new treatment with its specifications and requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="treatmentName">Treatment Name</Label>
              <Input 
                id="treatmentName" 
                value={newTreatment.name}
                onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })}
                placeholder="e.g., Electric Roller Blinds" 
              />
            </div>
            <div>
              <Label htmlFor="treatmentCategory">Category</Label>
              <select 
                id="treatmentCategory" 
                className="w-full p-2 border rounded-md"
                value={newTreatment.category}
                onChange={(e) => setNewTreatment({ ...newTreatment, category: e.target.value })}
              >
                <option value="">Select category...</option>
                <option value="Curtains">Curtains</option>
                <option value="Blinds">Blinds</option>
                <option value="Shutters">Shutters</option>
                <option value="Tracks">Tracks</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="treatmentDescription">Description</Label>
            <Textarea 
              id="treatmentDescription" 
              value={newTreatment.description}
              onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
              placeholder="Describe the treatment and its features..." 
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input 
                id="estimatedHours" 
                type="number" 
                step="0.1" 
                value={newTreatment.estimated_hours}
                onChange={(e) => setNewTreatment({ ...newTreatment, estimated_hours: parseFloat(e.target.value) || 0 })}
                placeholder="0.0" 
              />
            </div>
            <div>
              <Label htmlFor="laborRate">Labor Rate ($/hr)</Label>
              <Input 
                id="laborRate" 
                type="number" 
                step="0.01" 
                value={newTreatment.labor_rate}
                onChange={(e) => setNewTreatment({ ...newTreatment, labor_rate: parseFloat(e.target.value) || 0 })}
                placeholder="85.00" 
              />
            </div>
            <div>
              <Label htmlFor="complexity">Complexity</Label>
              <select 
                id="complexity" 
                className="w-full p-2 border rounded-md"
                value={newTreatment.complexity}
                onChange={(e) => setNewTreatment({ ...newTreatment, complexity: e.target.value as "Low" | "Medium" | "High" })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="materials">Required Materials (comma separated)</Label>
            <Input 
              id="materials" 
              value={newTreatment.required_materials.join(", ")}
              onChange={(e) => handleMaterialsChange(e.target.value)}
              placeholder="e.g., Motor, Control Unit, Brackets, Fabric" 
            />
          </div>

          <Button 
            onClick={handleCreateTreatment}
            disabled={createTreatmentType.isPending}
            className="bg-brand-primary hover:bg-brand-accent"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Treatment Type
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
