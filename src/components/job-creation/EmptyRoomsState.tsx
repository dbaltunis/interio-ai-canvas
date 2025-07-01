
import { Home } from "lucide-react";

interface EmptyRoomsStateProps {
  onCreateRoom: () => void;
}

export const EmptyRoomsState = ({ onCreateRoom }: EmptyRoomsStateProps) => {
  return (
    <div className="text-center py-12">
      <Home className="mx-auto h-16 w-16 text-gray-300 mb-6" />
      <h3 className="text-xl font-medium text-gray-900 mb-3">No rooms yet</h3>
      <p className="text-gray-500 text-lg mb-6 max-w-md mx-auto">
        Add your first room to start designing window treatments for this project
      </p>
      <p className="text-sm text-gray-400">
        Click the "Add Room" button above to get started
      </p>
    </div>
  );
};
