
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Wrench, Edit, Trash2, Copy } from "lucide-react";
import { useProductTemplates, mockTemplates } from "@/hooks/useProductTemplates";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SimplifiedRoomCardProps {
  room: any;
  treatments: any[];
  onAddTreatment: (roomId: string, treatmentType: string) => void;
  onCopyRoom: (room: any) => void;
  projectId: string;
}

export const SimplifiedRoomCard = ({ room, treatments, onAddTreatment, onCopyRoom, projectId }: SimplifiedRoomCardProps) => {
  const [showTreatmentTypes, setShowTreatmentTypes] = useState(false);
  const { data: templates = mockTemplates } = useProductTemplates();

  const roomTreatments = treatments.filter(t => t.room_id === room.id);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{room.name}</CardTitle>
        <Badge variant="secondary">{room.room_type}</Badge>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          {roomTreatments.length} treatments
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" size="sm" onClick={() => onCopyRoom(room)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>

        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={() => setShowTreatmentTypes(!showTreatmentTypes)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Treatment
          </Button>

          {showTreatmentTypes && (
            <div className="mt-2 space-y-2">
              {templates.filter(t => t.active).length > 0 ? (
                templates.filter(t => t.active).map((template) => (
                  <Button
                    key={template.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onAddTreatment(room.id, template.name)}
                  >
                    {template.name}
                  </Button>
                ))
              ) : (
                <Alert>
                  <AlertDescription>
                    No active templates found. Create templates in Settings → Product Templates.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
