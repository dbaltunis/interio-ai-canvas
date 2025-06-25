
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Wrench, Clock, Settings } from "lucide-react";

export const TreatmentTypesTab = () => {
  const treatmentTypes = [
    {
      id: 1,
      name: "Standard Curtains",
      category: "Curtains",
      estimatedHours: 2.5,
      complexity: "Medium",
      materials: ["Fabric", "Heading Tape", "Hooks"],
      laborRate: 85,
      description: "Traditional curtain with standard heading"
    },
    {
      id: 2,
      name: "Motorised Roman Blinds",
      category: "Blinds", 
      estimatedHours: 4.0,
      complexity: "High",
      materials: ["Fabric", "Motorised Mechanism", "Controls"],
      laborRate: 95,
      description: "Roman blind with automated controls"
    },
    {
      id: 3,
      name: "Plantation Shutters",
      category: "Shutters",
      estimatedHours: 6.0,
      complexity: "High", 
      materials: ["Timber Slats", "Frame", "Hardware"],
      laborRate: 105,
      description: "Custom-fitted timber plantation shutters"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Treatment Types</h3>
          <p className="text-sm text-brand-neutral">Configure standard treatments and their labor requirements</p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-accent">
          <Plus className="h-4 w-4 mr-2" />
          Add Treatment Type
        </Button>
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
                  <p className="text-sm text-brand-neutral mb-4">{treatment.description}</p>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-brand-neutral" />
                        <span className="font-medium text-sm">Labor Details</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div><span className="font-medium">Hours:</span> {treatment.estimatedHours}</div>
                        <div><span className="font-medium">Rate:</span> ${treatment.laborRate}/hr</div>
                        <div><span className="font-medium">Total:</span> ${(treatment.estimatedHours * treatment.laborRate).toFixed(2)}</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="h-4 w-4 text-brand-neutral" />
                        <span className="font-medium text-sm">Required Materials</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {treatment.materials.map((material) => (
                          <Badge key={material} variant="secondary" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
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
              <Input id="treatmentName" placeholder="e.g., Electric Roller Blinds" />
            </div>
            <div>
              <Label htmlFor="treatmentCategory">Category</Label>
              <select id="treatmentCategory" className="w-full p-2 border rounded-md">
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
            <Textarea id="treatmentDescription" placeholder="Describe the treatment and its features..." />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input id="estimatedHours" type="number" step="0.1" placeholder="0.0" />
            </div>
            <div>
              <Label htmlFor="laborRate">Labor Rate ($/hr)</Label>
              <Input id="laborRate" type="number" step="0.01" placeholder="85.00" />
            </div>
            <div>
              <Label htmlFor="complexity">Complexity</Label>
              <select id="complexity" className="w-full p-2 border rounded-md">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="materials">Required Materials (comma separated)</Label>
            <Input id="materials" placeholder="e.g., Motor, Control Unit, Brackets, Fabric" />
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">
            <Plus className="h-4 w-4 mr-2" />
            Create Treatment Type
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
