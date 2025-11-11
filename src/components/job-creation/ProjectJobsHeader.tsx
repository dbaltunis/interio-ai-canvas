
import { useState } from "react";
import { formatJobNumber } from "@/lib/format-job-number";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useTreatments } from "@/hooks/useTreatments";
import { formatCurrency } from "@/utils/currency";
import { useCurrency } from "@/hooks/useCurrency";

interface ProjectJobsHeaderProps {
  project: any;
  onUpdateName: (name: string) => Promise<void>;
  onCreateRoom: () => void;
  isCreatingRoom: boolean;
}

export const ProjectJobsHeader = ({ 
  project, 
  onUpdateName, 
  onCreateRoom, 
  isCreatingRoom 
}: ProjectJobsHeaderProps) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(project?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  
  const { units } = useMeasurementUnits();
  const { data: treatments = [] } = useTreatments(project?.id);
  const currency = useCurrency();

  // Calculate total amount from treatments for this specific project
  const totalAmount = treatments
    .filter(t => t.project_id === project?.id)
    .reduce((sum, treatment) => sum + (treatment.total_price || 0), 0);

  // Generate a proper sequential job number
  const jobNumber = project?.job_number || `${Date.now().toString().slice(-6)}`;

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setIsEditingName(false);
      setEditedName(project?.name || "");
      return;
    }
    
    setIsSaving(true);
    try {
      await onUpdateName(editedName.trim());
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to update project name:", error);
      // Reset to original name on error
      setEditedName(project?.name || "");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(project?.name || "");
    setIsEditingName(false);
  };

  const handleStartEdit = () => {
    setEditedName(project?.name || "");
    setIsEditingName(true);
  };

  return (
    <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            {isEditingName ? (
              <div className="flex items-center space-x-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white/20"
                  placeholder="Enter project name"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                  disabled={isSaving}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="text-white hover:bg-white/10"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold">{project?.name || "Untitled Project"}</h1>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleStartEdit}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 text-white/80">
            <span className="text-sm">Job #{formatJobNumber(jobNumber)}</span>
            <span className="text-2xl font-semibold">
              Total: {formatCurrency(totalAmount, currency)}
            </span>
          </div>
        </div>
        
        <Button
          onClick={onCreateRoom}
          disabled={isCreatingRoom}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-lg"
          size="lg"
        >
          {isCreatingRoom ? 'Adding Room...' : 'Add Room'}
        </Button>
      </div>
    </div>
  );
};
