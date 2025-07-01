
import { Button } from "@/components/ui/button";

interface TreatmentFormActionsProps {
  onCancel: () => void;
}

export const TreatmentFormActions = ({ onCancel }: TreatmentFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit">
        Save Treatment
      </Button>
    </div>
  );
};
