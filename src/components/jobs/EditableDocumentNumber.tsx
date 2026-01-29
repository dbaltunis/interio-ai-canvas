import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hash, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSequenceLabel, type EntityType } from "@/hooks/useNumberSequences";

interface EditableDocumentNumberProps {
  entityType: EntityType;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  autoLabel?: boolean; // If true, fetches label from settings
}

export const EditableDocumentNumber = ({
  entityType,
  value,
  onChange,
  label: propLabel,
  placeholder = "Enter number",
  disabled = false,
  autoLabel = false,
}: EditableDocumentNumberProps) => {
  const { label: settingsLabel, prefix } = useSequenceLabel(entityType);
  
  // Use settings label if autoLabel is true, otherwise use prop
  const label = autoLabel ? settingsLabel : (propLabel || settingsLabel);
  const [previewNumber, setPreviewNumber] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Preview what the next number WOULD be (without consuming it)
  // Industry standard: Only reserve/consume number on actual save
  useEffect(() => {
    const fetchPreview = async () => {
      if (hasLoaded) return;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Use preview function - does NOT increment counter
        const { data, error } = await supabase.rpc("preview_next_sequence_number", {
          p_user_id: user.id,
          p_entity_type: entityType,
        });

        if (!error && data) {
          setPreviewNumber(data);
          // Only set as value if no value is provided
          if (!value) {
            onChange(data);
          }
        }
      } catch (error) {
        console.error("Error previewing number:", error);
      } finally {
        setHasLoaded(true);
      }
    };

    fetchPreview();
  }, [entityType, hasLoaded, value, onChange]);

  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Hash className="h-4 w-4" />
        {label}
        {previewNumber && value === previewNumber && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Preview
          </span>
        )}
      </Label>
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {previewNumber && value === previewNumber && (
        <p className="text-xs text-muted-foreground">
          Number will be reserved when saved
        </p>
      )}
    </div>
  );
};
