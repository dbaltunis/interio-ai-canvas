import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export const ComponentsTab = () => {
  const [headings] = useState([
    { id: 1, name: "Pencil Pleat", fullness: 2.0, price: 15.00, active: true },
    { id: 2, name: "Pinch Pleat", fullness: 2.2, price: 25.00, active: true },
    { id: 3, name: "Wave", fullness: 2.5, price: 35.00, active: true }
  ]);

  const [hardware] = useState([
    { id: 1, name: "Curtain Track - Basic", price: 45.00, unit: "per-meter", active: true },
    { id: 2, name: "Curtain Rod - Premium", price: 85.00, unit: "per-meter", active: true },
    { id: 3, name: "Roman Blind Chain", price: 12.00, unit: "per-set", active: true }
  ]);

  const [linings] = useState([
    { id: 1, name: "Standard Lining", price: 8.50, unit: "per-meter", active: true },
    { id: 2, name: "Blackout Lining", price: 12.00, unit: "per-meter", active: true },
    { id: 3, name: "Thermal Lining", price: 15.00, unit: "per-meter", active: true }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Component Library</h3>
          <p className="text-sm text-brand-neutral">Manage reusable components for your products</p>
        </div>
      </div>

      <Tabs defaultValue="headings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="headings">Headings</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="linings">Linings</TabsTrigger>
          <TabsTrigger value="trimmings">Trimmings</TabsTrigger>
        </TabsList>

        <TabsContent value="headings">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Heading Options</h4>
              <Button size="sm" className="bg-brand-primary hover:bg-brand-accent">
                <Plus className="h-4 w-4 mr-2" />
                Add Heading
              </Button>
            </div>

            <div className="grid gap-3">
              {headings.map((heading) => (
                <Card key={heading.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch checked={heading.active} />
                        <div>
                          <h5 className="font-medium text-brand-primary">{heading.name}</h5>
                          <p className="text-sm text-brand-neutral">
                            Fullness: {heading.fullness}x • Price: ${heading.price}/meter
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hardware">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Hardware Components</h4>
              <Button size="sm" className="bg-brand-primary hover:bg-brand-accent">
                <Plus className="h-4 w-4 mr-2" />
                Add Hardware
              </Button>
            </div>

            <div className="grid gap-3">
              {hardware.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch checked={item.active} />
                        <div>
                          <h5 className="font-medium text-brand-primary">{item.name}</h5>
                          <p className="text-sm text-brand-neutral">
                            ${item.price} {item.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="linings">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Lining Options</h4>
              <Button size="sm" className="bg-brand-primary hover:bg-brand-accent">
                <Plus className="h-4 w-4 mr-2" />
                Add Lining
              </Button>
            </div>

            <div className="grid gap-3">
              {linings.map((lining) => (
                <Card key={lining.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch checked={lining.active} />
                        <div>
                          <h5 className="font-medium text-brand-primary">{lining.name}</h5>
                          <p className="text-sm text-brand-neutral">
                            ${lining.price} {lining.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trimmings">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-brand-neutral">Trimmings management coming soon</p>
                <Button className="mt-4 bg-brand-primary hover:bg-brand-accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Trimming
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};