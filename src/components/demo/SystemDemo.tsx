import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Eye, Settings, BarChart3 } from "lucide-react";
import { IntegrationStatus } from "../measurements/IntegrationStatus";
import { WindowTypeSelector } from "../window-types/WindowTypeSelector";
import { TreatmentPreviewEngine } from "../treatment-visualizers/TreatmentPreviewEngine";
import { FabricUsageDisplay } from "../job-creation/treatment-pricing/fabric-details/FabricUsageDisplay";
import type { TreatmentFormData } from "../job-creation/treatment-pricing/useTreatmentFormData";

export const SystemDemo = () => {
  const [selectedWindowType, setSelectedWindowType] = useState<any>(null);
  const [demoMeasurements, setDemoMeasurements] = useState({
    width: "180",
    height: "200",
    rail_width: "180", 
    drop: "200"
  });

  const demoFabricData: TreatmentFormData = {
    product_name: "Demo Curtains",
    rail_width: "180",
    drop: "200",
    pooling: "0",
    quantity: 1,
    fabric_type: "Cotton",
    fabric_code: "DEMO001",
    fabric_cost_per_yard: "45",
    fabric_width: "140",
    roll_direction: "horizontal",
    heading_fullness: "2.5",
    selected_heading: "pencil_pleat",
    header_hem: "8",
    bottom_hem: "15",
    side_hem: "7.5",
    seam_hem: "1.5",
    custom_labor_rate: "25",
    selected_options: [],
    notes: "",
    images: []
  };

  const demoCosts = {
    fabricOrientation: "horizontal",
    seamsRequired: 2,
    seamLaborHours: 1.5,
    widthsRequired: 3
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Dynamic Window Treatment System</h1>
        <p className="text-muted-foreground">
          Experience the complete integration of window types, treatments, visualizations, and pricing
        </p>
      </div>

      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Live Demo
          </TabsTrigger>
          <TabsTrigger value="visualizer" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visualizers
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Window Type Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <WindowTypeSelector
                  selectedWindowType={selectedWindowType}
                  onWindowTypeChange={setSelectedWindowType}
                />
                {selectedWindowType && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                    <Badge variant="default">Selected: {selectedWindowType.name}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Key: {selectedWindowType.key}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Treatment Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <TreatmentPreviewEngine
                  windowType={selectedWindowType?.key || "standard"}
                  treatmentType="curtains"
                  measurements={demoMeasurements}
                  className="min-h-[300px] border rounded-lg"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fabric Usage Calculation</CardTitle>
            </CardHeader>
            <CardContent>
              <FabricUsageDisplay
                fabricUsage="8.5"
                formData={demoFabricData}
                costs={demoCosts}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualizer" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standard Window + Curtains</CardTitle>
              </CardHeader>
              <CardContent>
                <TreatmentPreviewEngine
                  windowType="standard"
                  treatmentType="curtains"
                  measurements={demoMeasurements}
                  className="h-[200px] border rounded-lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bay Window + Curtains</CardTitle>
              </CardHeader>
              <CardContent>
                <TreatmentPreviewEngine
                  windowType="bay"
                  treatmentType="curtains"
                  measurements={{ ...demoMeasurements, center_width: "120", side_width: "60" }}
                  className="h-[200px] border rounded-lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Standard Window + Blinds</CardTitle>
              </CardHeader>
              <CardContent>
                <TreatmentPreviewEngine
                  windowType="standard"
                  treatmentType="blinds"
                  measurements={demoMeasurements}
                  className="h-[200px] border rounded-lg"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Key Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="default">Dynamic</Badge>
                  <span className="text-sm">Real-time window type selection</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default">Visual</Badge>
                  <span className="text-sm">Live treatment previews</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default">Smart</Badge>
                  <span className="text-sm">Automatic cost calculation</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default">Compatible</Badge>
                  <span className="text-sm">Works with existing data</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🔧 Technical Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Bridge</Badge>
                  <span className="text-sm">Seamless mode switching</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Migration</Badge>
                  <span className="text-sm">Legacy format conversion</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Auto-save</Badge>
                  <span className="text-sm">Intelligent data persistence</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Validation</Badge>
                  <span className="text-sm">Data integrity checks</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status">
          <IntegrationStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};