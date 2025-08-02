import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CurtainTemplatesManager } from "./products/CurtainTemplatesManager";
import { Settings, Layers, DollarSign, Wrench } from "lucide-react";

export const WindowCoveringsTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Window Coverings Management</CardTitle>
          <CardDescription>
            Comprehensive management system for curtain templates, pricing, and manufacturing configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="manufacturing" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Manufacturing
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              <CurtainTemplatesManager />
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Overview</CardTitle>
                  <CardDescription>
                    Summary of pricing configurations across all templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Per Metre Templates</h4>
                      <Badge variant="secondary">Most flexible</Badge>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Per Curtain Templates</h4>
                      <Badge variant="secondary">Fixed pricing</Badge>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Pricing Grid Templates</h4>
                      <Badge variant="secondary">Complex matrix</Badge>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Hand vs Machine</h4>
                      <Badge variant="secondary">Dual pricing</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manufacturing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manufacturing Configuration</CardTitle>
                  <CardDescription>
                    Fabric usage rules and manufacturing settings overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Standard Allowances</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Returns (L/R):</span>
                            <span>7.5cm each</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Overlap:</span>
                            <span>10cm</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Header Allowance:</span>
                            <span>8cm</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bottom Hem:</span>
                            <span>15cm</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Waste %:</span>
                            <span>5%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Advanced Options</h4>
                        <div className="space-y-2">
                          <Badge variant="outline">Railroading Support</Badge>
                          <Badge variant="outline">Pattern Matching</Badge>
                          <Badge variant="outline">Custom Hems</Badge>
                          <Badge variant="outline">Fullness Ratios</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    Global configuration and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Measurement Units</h4>
                      <p className="text-sm text-muted-foreground">Currently using centimetres (cm) for all measurements</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Default Values</h4>
                      <p className="text-sm text-muted-foreground">Configure default hem allowances, waste percentages, and other manufacturing defaults</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Integration Settings</h4>
                      <p className="text-sm text-muted-foreground">Inventory integration, hardware compatibility, and project workflow settings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};