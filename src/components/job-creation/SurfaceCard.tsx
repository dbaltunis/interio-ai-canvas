
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SurfaceCardProps {
  surface: any;
  treatments: any[];
  onAddTreatment: (surfaceId: string, treatmentType: string) => void;
  onDeleteSurface: (surfaceId: string) => void;
  onUpdateSurface: (surfaceId: string, updates: any) => void;
}

export const SurfaceCard = ({ 
  surface, 
  treatments, 
  onAddTreatment, 
  onDeleteSurface, 
  onUpdateSurface 
}: SurfaceCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: surface.name,
    width: surface.width || surface.surface_width || 0,
    height: surface.height || surface.surface_height || 0,
    surface_type: surface.surface_type || 'window'
  });

  const surfaceTotal = treatments.reduce((sum, t) => sum + (t.total_price || 0), 0);

  const handleSave = () => {
    onUpdateSurface(surface.id, editData);
    setIsEditing(false);
  };

  const getSurfaceIcon = (type: string) => {
    return type === 'wall' ? '🧱' : '🪟';
  };

  return (
    <Card className="mb-4 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getSurfaceIcon(surface.surface_type || 'window')}</span>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-32"
                />
                <Select 
                  value={editData.surface_type} 
                  onValueChange={(value) => setEditData({...editData, surface_type: value})}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="window">Window</SelectItem>
                    <SelectItem value="wall">Wall</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <CardTitle className="text-lg">{surface.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {surface.surface_type === 'wall' ? 'Wall' : 'Window'}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-green-600">${surfaceTotal.toFixed(2)}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeleteSurface(surface.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isEditing && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-xs text-gray-500">Width</label>
              <Input
                type="number"
                value={editData.width}
                onChange={(e) => setEditData({...editData, width: parseFloat(e.target.value) || 0})}
                className="h-8"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Height</label>
              <Input
                type="number"
                value={editData.height}
                onChange={(e) => setEditData({...editData, height: parseFloat(e.target.value) || 0})}
                className="h-8"
              />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {treatments.map((treatment) => (
            <div key={treatment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{treatment.product_name || treatment.treatment_type}</span>
                <div className="text-xs text-gray-500">
                  Material: ${treatment.material_cost || 0} | Labor: ${treatment.labor_cost || 0}
                </div>
              </div>
              <span className="font-bold">${treatment.total_price?.toFixed(2) || '0.00'}</span>
            </div>
          ))}
          
          <Select onValueChange={(treatmentType) => onAddTreatment(surface.id, treatmentType)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Add treatment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Curtains">Curtains</SelectItem>
              <SelectItem value="Blinds">Blinds</SelectItem>
              <SelectItem value="Shutters">Shutters</SelectItem>
              <SelectItem value="Valances">Valances</SelectItem>
              <SelectItem value="Wall Covering">Wall Covering</SelectItem>
              <SelectItem value="Paint">Paint</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
