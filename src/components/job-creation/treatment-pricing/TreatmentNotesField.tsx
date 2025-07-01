
import { Label } from "@/components/ui/label";

interface TreatmentNotesFieldProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const TreatmentNotesField = ({ 
  notes, 
  onNotesChange 
}: TreatmentNotesFieldProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 items-start">
      <Label htmlFor="notes">Notes</Label>
      <textarea
        id="notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={3}
        placeholder="Special instructions or notes for the workroom..."
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
};
