
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Download, Calculator, Grid } from "lucide-react";

export const InventoryPricingManager = () => {
  const [selectedPricingMethod, setSelectedPricingMethod] = useState("per_unit");

  const pricingMethods = [
    { value: "per_unit", label: "Per Unit", description: "Fixed price per unit" },
    { value: "per_drop", label: "Per Drop", description: "Pricing based on drop measurements" },
    { value: "csv_grid", label: "CSV Grid", description: "Complex pricing matrix from CSV" },
    { value: "tiered", label: "Tiered", description: "Volume-based pricing tiers" }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pricing Methods</CardTitle>
          <CardDescription>Configure flexible pricing for your inventory items</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="methods">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="methods">Methods</TabsTrigger>
              <TabsTrigger value="grids">Pricing Grids</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="methods" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {pricingMethods.map((method) => (
                  <Card key={method.value} className="cursor-pointer hover:bg-gray-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{method.label}</CardTitle>
                        <Badge variant="outline">
                          {method.value === selectedPricingMethod ? "Active" : "Available"}
                        </Badge>
                      </div>
                      <CardDescription>{method.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant={method.value === selectedPricingMethod ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPricingMethod(method.value)}
                      >
                        {method.value === selectedPricingMethod ? "Selected" : "Select"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="grids" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Pricing Grids</h3>
                  <p className="text-sm text-gray-600">Upload and manage CSV pricing grids</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Grid
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Grid className="h-5 w-5" />
                    <span>Sample Pricing Grid</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="font-semibold">Width/Drop</div>
                    <div className="font-semibold">100cm</div>
                    <div className="font-semibold">150cm</div>
                    <div className="font-semibold">200cm</div>
                    
                    <div className="font-semibold">120cm</div>
                    <div>$45</div>
                    <div>$65</div>
                    <div>$85</div>
                    
                    <div className="font-semibold">180cm</div>
                    <div>$55</div>
                    <div>$75</div>
                    <div>$95</div>
                    
                    <div className="font-semibold">240cm</div>
                    <div>$65</div>
                    <div>$85</div>
                    <div>$105</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Rules</CardTitle>
                  <CardDescription>Set up automated pricing rules and calculations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="markup">Markup Percentage</Label>
                      <Input id="markup" type="number" placeholder="25" />
                    </div>
                    <div>
                      <Label htmlFor="minimum">Minimum Price</Label>
                      <Input id="minimum" type="number" placeholder="10.00" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select defaultValue="USD">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="NZD">NZD (NZ$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button>
                    <Calculator className="h-4 w-4 mr-2" />
                    Apply Rules
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
