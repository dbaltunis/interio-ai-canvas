import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  MoreVertical,
  Square
} from "lucide-react";
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSurfaces } from "@/hooks/useSurfaces";

interface SimplifiedTreatmentCardProps {
  treatment: any;
  projectId: string;
}

export const SimplifiedTreatmentCard = ({ treatment, projectId }: SimplifiedTreatmentCardProps) => {
  const [isEditingWindow, setIsEditingWindow] = useState(false);
  const [windowName, setWindowName] = useState("");
  const { toast } = useToast();
  const { data: surfaces } = useSurfaces(projectId);

  // Get the surface/window name
  const surface = surfaces?.find(s => s.id === treatment.window_id);
  const currentWindowName = surface?.name || "Window #1";

  // Initialize window name
  React.useEffect(() => {
    setWindowName(currentWindowName);
  }, [currentWindowName]);

  const handleUpdateWindowName = async () => {
    if (!windowName.trim() || windowName === currentWindowName) {
      setIsEditingWindow(false);
      return;
    }

    try {
      await supabase
        .from('surfaces')
        .update({ name: windowName.trim() })
        .eq('id', treatment.window_id);

      toast({
        title: "Window Updated",
        description: "Window name updated successfully",
      });
    } catch (error) {
      console.error("Failed to update window name:", error);
      toast({
        title: "Error",
        description: "Failed to update window name",
        variant: "destructive",
      });
      setWindowName(currentWindowName);
    }
    setIsEditingWindow(false);
  };

  const handleCopyTreatment = async () => {
    try {
      // Create a new surface for the copied treatment
      const surfaceData = {
        name: `${currentWindowName} (Copy)`,
        project_id: projectId,
        room_id: treatment.room_id,
        surface_type: 'window',
        width: surface?.width || 60,
        height: surface?.height || 48
      };

      const { data: newSurface } = await supabase
        .from('surfaces')
        .insert(surfaceData)
        .select()
        .single();

      if (newSurface) {
        // Copy the treatment
        const treatmentData = {
          project_id: projectId,
          room_id: treatment.room_id,
          window_id: newSurface.id,
          treatment_type: treatment.treatment_type,
          product_name: treatment.product_name,
          fabric_type: treatment.fabric_type,
          color: treatment.color,
          pattern: treatment.pattern,
          hardware: treatment.hardware,
          mounting_type: treatment.mounting_type,
          measurements: treatment.measurements,
          material_cost: treatment.material_cost,
          labor_cost: treatment.labor_cost,
          total_price: treatment.total_price,
          unit_price: treatment.unit_price,
          quantity: treatment.quantity,
          notes: treatment.notes,
          treatment_details: treatment.treatment_details,
          calculation_details: treatment.calculation_details,
          fabric_details: treatment.fabric_details
        };

        await supabase.from('treatments').insert(treatmentData);
        
        toast({
          title: "Treatment Copied",
          description: `${treatment.treatment_type} copied successfully`,
        });
      }
    } catch (error) {
      console.error("Failed to copy treatment:", error);
      toast({
        title: "Error",
        description: "Failed to copy treatment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTreatment = async () => {
    if (!confirm(`Delete this ${treatment.treatment_type}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete treatment
      await supabase.from('treatments').delete().eq('id', treatment.id);
      
      // Delete associated surface
      if (treatment.window_id) {
        await supabase.from('surfaces').delete().eq('id', treatment.window_id);
      }
      
      toast({
        title: "Treatment Deleted",
        description: `${treatment.treatment_type} has been deleted`,
      });
    } catch (error) {
      console.error("Failed to delete treatment:", error);
      toast({
        title: "Error",
        description: "Failed to delete treatment",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-l-4 border-l-primary bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Square className="h-4 w-4 text-muted-foreground" />
              {isEditingWindow ? (
                <Input
                  value={windowName}
                  onChange={(e) => setWindowName(e.target.value)}
                  onBlur={handleUpdateWindowName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateWindowName();
                    if (e.key === 'Escape') {
                      setWindowName(currentWindowName);
                      setIsEditingWindow(false);
                    }
                  }}
                  className="h-6 text-sm font-medium"
                  autoFocus
                />
              ) : (
                <span 
                  className="text-sm font-medium cursor-pointer hover:text-primary"
                  onClick={() => setIsEditingWindow(true)}
                >
                  {currentWindowName}
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{treatment.treatment_type}</Badge>
                {treatment.total_price && (
                  <Badge variant="outline">${treatment.total_price.toFixed(2)}</Badge>
                )}
              </div>
              
              {treatment.product_name && (
                <p className="text-sm text-foreground">{treatment.product_name}</p>
              )}
              
              {(treatment.fabric_type || treatment.color) && (
                <p className="text-xs text-muted-foreground">
                  {[treatment.fabric_type, treatment.color].filter(Boolean).join(" • ")}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Treatment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyTreatment}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Treatment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDeleteTreatment}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Treatment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};