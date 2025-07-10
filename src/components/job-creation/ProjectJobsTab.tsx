
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useCreateRoom } from "@/hooks/useRooms";
import { useToast } from "@/hooks/use-toast";
import { Plus, Home, Package, Palette, Wrench } from "lucide-react";

interface ProjectJobsTabProps {
  project: any;
  onProjectUpdate?: (updatedProject: any) => void;
}

export const ProjectJobsTab = ({ project, onProjectUpdate }: ProjectJobsTabProps) => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const createRoom = useCreateRoom();
  const { toast } = useToast();

  const productTemplates = [
    { id: 'curtains', name: 'Curtains & Drapes', icon: Home, color: 'bg-blue-50 border-blue-200' },
    { id: 'blinds', name: 'Blinds & Shades', icon: Package, color: 'bg-green-50 border-green-200' },
    { id: 'wallpaper', name: 'Wallpaper', icon: Palette, color: 'bg-purple-50 border-purple-200' },
    { id: 'services', name: 'Services', icon: Wrench, color: 'bg-orange-50 border-orange-200' }
  ];

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);
    try {
      const roomCount = 1; // Simple increment
      await createRoom.mutateAsync({
        name: `Room ${roomCount}`,
        project_id: project.id,
        room_type: 'living_room'
      });
      toast({
        title: "Room Added",
        description: "New room created. Now add products to it.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simple Project Header */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{project?.name}</h2>
            <p className="text-sm text-muted-foreground">Job #{project?.job_number}</p>
          </div>
        </div>
      </div>

      {/* Simple Room Creation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Add Rooms</h3>
            <p className="text-sm text-muted-foreground">Create rooms and add products to each one</p>
          </div>
          <Button onClick={handleCreateRoom} disabled={isCreatingRoom}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreatingRoom ? "Adding..." : "Add Room"}
          </Button>
        </div>

        {/* Product Templates */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {productTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.id} className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${template.color}`}>
                <div className="text-center space-y-2">
                  <Icon className="h-8 w-8 mx-auto text-gray-600" />
                  <p className="font-medium text-sm">{template.name}</p>
                  <p className="text-xs text-muted-foreground">Use templates from settings</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Add rooms to your project</li>
            <li>2. Select products from your templates (created in Settings)</li>
            <li>3. Add measurements and fabric selections</li>
            <li>4. Move to Quote to see pricing</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
