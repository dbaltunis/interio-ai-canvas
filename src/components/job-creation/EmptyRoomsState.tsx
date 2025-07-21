
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Home } from "lucide-react";

interface EmptyRoomsStateProps {
  onCreateRoom: () => void;
  isCreatingRoom: boolean;
}

export const EmptyRoomsState = ({ onCreateRoom, isCreatingRoom }: EmptyRoomsStateProps) => {
  return (
    <Card className="bg-gradient-to-br from-brand-light to-white border-brand-secondary/20">
      <CardContent className="p-12 text-center">
        <div className="mb-6">
          <Home className="h-16 w-16 text-brand-primary mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-brand-primary mb-2">
            No rooms added yet
          </h3>
          <p className="text-brand-neutral max-w-md mx-auto">
            Start by adding rooms to this project. You can then configure window treatments, 
            measurements, and specifications for each room.
          </p>
        </div>
        
        <Button
          onClick={onCreateRoom}
          disabled={isCreatingRoom}
          size="lg"
          className="bg-brand-primary hover:bg-brand-primary/90"
        >
          <Plus className="h-5 w-5 mr-2" />
          {isCreatingRoom ? 'Creating Room...' : 'Add Your First Room'}
        </Button>
        
        <div className="mt-8 pt-8 border-t border-brand-secondary/20">
          <p className="text-sm text-brand-neutral/70">
            💡 Tip: You can add multiple room types like living rooms, bedrooms, kitchens, and more
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
