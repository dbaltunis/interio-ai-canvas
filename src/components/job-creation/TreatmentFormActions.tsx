
import { Button } from "@/components/ui/button";

interface TreatmentFormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export const TreatmentFormActions = ({ onCancel, onSubmit }: TreatmentFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" onClick={onSubmit}>
        Add Treatment
      </Button>
    </div>
  );
};
