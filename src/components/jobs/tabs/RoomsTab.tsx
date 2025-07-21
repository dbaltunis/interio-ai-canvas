
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface RoomsTabProps {
  projectId: string;
}

export const RoomsTab = ({ projectId }: RoomsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Rooms & Treatments</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium mb-2">No rooms added yet</h3>
            <p className="text-gray-500 mb-4">
              Start by adding rooms to this project and then configure window treatments for each room.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
