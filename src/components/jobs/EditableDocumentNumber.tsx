import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw, Hash, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSequenceLabel, type EntityType } from "@/hooks/useNumberSequences";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EditableDocumentNumberProps {
  entityType: EntityType;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  showRegenerateButton?: boolean;
  autoLabel?: boolean; // If true, fetches label from settings
}

export const EditableDocumentNumber = ({
  entityType,
  value,
  onChange,
  label: propLabel,
  placeholder = "Enter or generate number",
  disabled = false,
  showRegenerateButton = true,
  autoLabel = false,
}: EditableDocumentNumberProps) => {
  const { label: settingsLabel, prefix } = useSequenceLabel(entityType);
  
  // Use settings label if autoLabel is true, otherwise use prop
  const label = autoLabel ? settingsLabel : (propLabel || settingsLabel);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Auto-generate number on first mount if value is empty
  useEffect(() => {
    if (!hasLoaded && !value) {
      generateNextNumber();
      setHasLoaded(true);
    } else {
      setHasLoaded(true);
    }
  }, []);

  const generateNextNumber = async () => {
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("get_next_sequence_number", {
        p_user_id: user.id,
        p_entity_type: entityType,
      });

      if (error) throw error;

      if (data) {
        onChange(data);
      }
    } catch (error: any) {
      console.error("Error generating number:", error);
      // Generate fallback number
      const prefix = entityType === 'quote' ? 'QT' : 
                     entityType === 'invoice' ? 'INV' : 
                     entityType === 'order' ? 'ORD' : 
                     entityType === 'draft' ? 'DFT' : 'DOC';
      onChange(`${prefix}-${Date.now().toString().slice(-6)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Hash className="h-4 w-4" />
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isGenerating}
          className="flex-1"
        />
        {showRegenerateButton && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={disabled || isGenerating}
                title="Generate next number (will skip current)"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Generate New Number?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will generate the next number in sequence and skip the current one.
                  The current number "{value}" will be lost. Are you sure?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={generateNextNumber}>
                  Generate New Number
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Auto-generated or enter a custom number
      </p>
    </div>
  );
};
