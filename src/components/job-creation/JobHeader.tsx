
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface JobHeaderProps {
  jobNumber: string;
  totalAmount: number;
  onCreateRoom: () => void;
  isCreatingRoom: boolean;
}

export const JobHeader = ({ jobNumber, totalAmount, onCreateRoom, isCreatingRoom }: JobHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {jobNumber || 'No Job Number'}
        </h2>
        <p className="text-3xl font-bold text-green-600">
          Total: ${totalAmount.toFixed(2)}
        </p>
      </div>
      <Button 
        onClick={onCreateRoom} 
        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
        disabled={isCreatingRoom}
      >
        <Plus className="h-4 w-4" />
        <span>{isCreatingRoom ? "Adding..." : "Add Room"}</span>
      </Button>
    </div>
  );
};
