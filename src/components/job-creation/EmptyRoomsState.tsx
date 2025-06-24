
import { Button } from "@/components/ui/button";
import { Plus, Home } from "lucide-react";

interface EmptyRoomsStateProps {
  onCreateRoom: () => void;
}

export const EmptyRoomsState = ({ onCreateRoom }: EmptyRoomsStateProps) => {
  return (
    <div className="text-center py-12">
      <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
      <p className="text-gray-500 mb-4">
        Add your first room to start designing window treatments
      </p>
      <Button onClick={onCreateRoom} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
        <Plus className="h-4 w-4" />
        <span>Add your first room</span>
      </Button>
    </div>
  );
};
