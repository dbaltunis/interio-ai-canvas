import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Bed, ChefHat, Bath, Briefcase, Car, Plus, Copy, Star } from "lucide-react";

interface RoomTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  surfaces: {
    type: string;
    name: string;
    dimensions: { width: number; height: number };
    defaultTreatment?: string;
  }[];
  estimatedValue: number;
  popular: boolean;
}

interface RoomTemplatesProps {
  onCreateFromTemplate: (template: RoomTemplate, customName?: string) => void;
}

const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: "living-room-standard",
    name: "Standard Living Room",
    type: "living_room",
    description: "Main window with side panels, perfect for traditional homes",
    icon: Home,
    surfaces: [
      { type: "window", name: "Main Window", dimensions: { width: 120, height: 60 } },
      { type: "window", name: "Side Window", dimensions: { width: 60, height: 60 } }
    ],
    estimatedValue: 1200,
    popular: true
  },
  {
    id: "bedroom-master",
    name: "Master Bedroom",
    type: "bedroom",
    description: "Large window with blackout requirements",
    icon: Bed,
    surfaces: [
      { type: "window", name: "Main Window", dimensions: { width: 100, height: 55 }, defaultTreatment: "blackout_curtains" },
      { type: "window", name: "Side Window", dimensions: { width: 50, height: 55 }, defaultTreatment: "blackout_curtains" }
    ],
    estimatedValue: 900,
    popular: true
  },
  {
    id: "kitchen-modern",
    name: "Modern Kitchen",
    type: "kitchen",
    description: "Water-resistant treatments for kitchen windows",
    icon: ChefHat,
    surfaces: [
      { type: "window", name: "Above Sink", dimensions: { width: 60, height: 40 }, defaultTreatment: "roller_blinds" },
      { type: "window", name: "Breakfast Nook", dimensions: { width: 80, height: 50 }, defaultTreatment: "roller_blinds" }
    ],
    estimatedValue: 600,
    popular: false
  },
  {
    id: "bathroom-standard",
    name: "Standard Bathroom",
    type: "bathroom",
    description: "Moisture-resistant privacy solutions",
    icon: Bath,
    surfaces: [
      { type: "window", name: "Main Window", dimensions: { width: 40, height: 30 }, defaultTreatment: "privacy_film" }
    ],
    estimatedValue: 200,
    popular: false
  },
  {
    id: "office-home",
    name: "Home Office",
    type: "office",
    description: "Light control for computer work",
    icon: Briefcase,
    surfaces: [
      { type: "window", name: "Main Window", dimensions: { width: 80, height: 55 }, defaultTreatment: "venetian_blinds" },
      { type: "window", name: "Side Window", dimensions: { width: 60, height: 55 }, defaultTreatment: "venetian_blinds" }
    ],
    estimatedValue: 750,
    popular: false
  }
];

export const RoomTemplates = ({ onCreateFromTemplate }: RoomTemplatesProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<RoomTemplate | null>(null);
  const [customName, setCustomName] = useState("");
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  const handleUseTemplate = (template: RoomTemplate) => {
    setSelectedTemplate(template);
    setCustomName(template.name);
    setShowCustomDialog(true);
  };

  const handleCreateRoom = () => {
    if (selectedTemplate) {
      onCreateFromTemplate(selectedTemplate, customName || selectedTemplate.name);
      setShowCustomDialog(false);
      setCustomName("");
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-semibold mb-2">Room Templates</h3>
        <p className="text-muted-foreground">
          Get started quickly with pre-configured room layouts and treatments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROOM_TEMPLATES.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <template.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.popular && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{template.description}</p>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Includes:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {template.surfaces.map((surface, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span>• {surface.name}</span>
                      <span className="text-xs">{surface.dimensions.width}"×{surface.dimensions.height}"</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <span className="text-sm text-muted-foreground">Est. Value:</span>
                  <span className="font-medium ml-1">${template.estimatedValue.toLocaleString()}</span>
                </div>
                
                <Button 
                  size="sm" 
                  onClick={() => handleUseTemplate(template)}
                  className="group-hover:shadow-md transition-all"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Room Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Room from Template</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <selectedTemplate.icon className="h-6 w-6 text-primary" />
                <div>
                  <h4 className="font-medium">{selectedTemplate.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="room-name">Room Name</Label>
                <Input
                  id="room-name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter room name"
                />
              </div>
              
              <div>
                <Label>Template Includes:</Label>
                <div className="mt-2 space-y-2">
                  {selectedTemplate.surfaces.map((surface, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{surface.name}</span>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{surface.dimensions.width}"×{surface.dimensions.height}"</span>
                        {surface.defaultTreatment && (
                          <Badge variant="outline" className="text-xs">
                            {surface.defaultTreatment.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRoom} disabled={!customName.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Room
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};