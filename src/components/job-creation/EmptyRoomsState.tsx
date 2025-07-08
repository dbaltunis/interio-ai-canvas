
import { Button } from "@/components/ui/button";
import { Plus, Home, Square } from "lucide-react";

interface EmptyRoomsStateProps {
  onCreateRoom: () => void;
  isCreatingRoom: boolean;
}

export const EmptyRoomsState = ({ onCreateRoom, isCreatingRoom }: EmptyRoomsStateProps) => {
  return (
    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
      <div className="mx-auto max-w-md">
        {/* Icon Section */}
        <div className="flex justify-center items-center space-x-2 mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <Home className="h-8 w-8 text-blue-600" />
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <Square className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          Start Building Your Project
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Create rooms to organize your project, then add windows and surfaces to each room. 
          You can add treatments and calculate pricing for each surface.
        </p>
        
        {/* Action Button */}
        <Button
          onClick={onCreateRoom}
          disabled={isCreatingRoom}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          <span className="font-semibold">
            {isCreatingRoom ? 'Creating Your First Room...' : 'Create Your First Room'}
          </span>
        </Button>
        
        {/* Helper Text */}
        <p className="text-sm text-gray-500 mt-4">
          After creating a room, you'll be able to add windows, walls, and treatments
        </p>
      </div>
    </div>
  );
};
