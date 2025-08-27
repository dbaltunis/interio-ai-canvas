import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Package, Wrench, Settings, Save, Trash2 } from "lucide-react";

interface AssemblyComponent {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  category: string;
}

export const AssemblyKitBuilder = () => {
  const [selectedComponents, setSelectedComponents] = useState<AssemblyComponent[]>([]);
  const [assemblyName, setAssemblyName] = useState("");
  const [assemblyDescription, setAssemblyDescription] = useState("");
  const [assemblyType, setAssemblyType] = useState<string>("");

  const availableComponents: AssemblyComponent[] = [
    { id: "1", name: "Aluminum Track 3m", quantity: 1, unit_price: 45.00, category: "track" },
    { id: "2", name: "End Brackets (Pair)", quantity: 2, unit_price: 12.50, category: "bracket" },
    { id: "3", name: "Track Gliders (Pack of 20)", quantity: 1, unit_price: 8.00, category: "accessory" },
    { id: "4", name: "Motor Unit - Somfy", quantity: 1, unit_price: 285.00, category: "motor" },
    { id: "5", name: "Remote Control", quantity: 1, unit_price: 45.00, category: "accessory" },
    { id: "6", name: "End Stops (Pair)", quantity: 1, unit_price: 6.00, category: "accessory" },
  ];

  const addComponent = (component: AssemblyComponent) => {
    const existing = selectedComponents.find(c => c.id === component.id);
    if (existing) {
      setSelectedComponents(prev =>
        prev.map(c => c.id === component.id ? { ...c, quantity: c.quantity + 1 } : c)
      );
    } else {
      setSelectedComponents(prev => [...prev, { ...component, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedComponents(prev => prev.filter(c => c.id !== id));
    } else {
      setSelectedComponents(prev =>
        prev.map(c => c.id === id ? { ...c, quantity } : c)
      );
    }
  };

  const totalCost = selectedComponents.reduce((sum, component) => 
    sum + (component.unit_price * component.quantity), 0
  );

  const suggestedPrice = totalCost * 1.3; // 30% markup

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assembly Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Build Assembly Kit
            </CardTitle>
            <CardDescription>
              Create pre-configured hardware kits for faster quoting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Assembly Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="assembly-name">Assembly Name</Label>
                <Input
                  id="assembly-name"
                  placeholder="e.g., Complete Track System 3m"
                  value={assemblyName}
                  onChange={(e) => setAssemblyName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="assembly-type">Assembly Type</Label>
                <Select value={assemblyType} onValueChange={setAssemblyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assembly type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="track_system">Track System</SelectItem>
                    <SelectItem value="rod_system">Rod System</SelectItem>
                    <SelectItem value="motor_kit">Motor Kit</SelectItem>
                    <SelectItem value="bracket_set">Bracket Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assembly-description">Description</Label>
                <Textarea
                  id="assembly-description"
                  placeholder="Describe what's included in this assembly..."
                  value={assemblyDescription}
                  onChange={(e) => setAssemblyDescription(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Available Components */}
            <div>
              <h3 className="font-semibold mb-3">Available Components</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableComponents.map((component) => (
                  <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{component.name}</div>
                        <div className="text-xs text-muted-foreground">${component.unit_price}</div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addComponent(component)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Components */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Selected Components
            </CardTitle>
            <CardDescription>
              Components included in this assembly kit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedComponents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No components selected yet</p>
                <p className="text-sm">Add components from the left panel</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {selectedComponents.map((component) => (
                    <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{component.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ${component.unit_price} each
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(component.id, component.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{component.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(component.id, component.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(component.id, 0)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total Cost:</span>
                    <span className="font-medium">${totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Suggested Price (30% markup):</span>
                    <span className="font-medium text-green-600">${suggestedPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Profit Margin:</span>
                    <span className="font-medium">${(suggestedPrice - totalCost).toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    disabled={!assemblyName || !assemblyType || selectedComponents.length === 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Assembly
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSelectedComponents([]);
                    setAssemblyName("");
                    setAssemblyDescription("");
                    setAssemblyType("");
                  }}>
                    Clear
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Existing Assemblies */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Assembly Kits</CardTitle>
          <CardDescription>
            Manage your pre-configured hardware assemblies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Mock existing assemblies */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Complete Track System 3m</h3>
                    <Badge variant="secondary">Track System</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Includes track, brackets, gliders, and end stops
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">$78.50</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Clone</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Motorized Track Kit</h3>
                    <Badge variant="secondary">Motor Kit</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track system with Somfy motor and remote
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">$425.00</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Clone</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
