
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatJobNumber } from "@/lib/format-job-number";

interface JobHeaderProps {
  jobNumber: string;
  totalAmount: number;
  onCreateRoom: () => void;
  isCreatingRoom: boolean;
}

export const JobHeader = ({ jobNumber, totalAmount, onCreateRoom, isCreatingRoom }: JobHeaderProps) => {
  return (
    <Card className="mb-6 bg-brand-light border-brand-secondary/20 shadow-lg">
      <CardHeader className="bg-brand-primary text-brand-light rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Job #{formatJobNumber(jobNumber)}</CardTitle>
            <p className="text-brand-light/80 text-lg mt-1">
              Total: ${totalAmount.toFixed(2)}
            </p>
          </div>
          <Button
            onClick={onCreateRoom}
            disabled={isCreatingRoom}
            className="bg-brand-accent hover:bg-brand-accent/90 text-brand-light border-brand-light/20"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            {isCreatingRoom ? 'Adding Room...' : 'Add Room'}
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};
