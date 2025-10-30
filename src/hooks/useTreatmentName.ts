import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to manage treatment naming with fallback hierarchy
 * Priority: treatment_name > product_name > template_name > treatment_type
 */
export const useTreatmentName = (
  treatmentId: string,
  initialName?: string,
  templateName?: string,
  treatmentType?: string
) => {
  const { toast } = useToast();
  const [treatmentName, setTreatmentName] = useState(
    initialName || templateName || treatmentType || 'Treatment'
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTreatmentName(initialName || templateName || treatmentType || 'Treatment');
  }, [initialName, templateName, treatmentType]);

  const updateTreatmentName = async (newName: string) => {
    if (!newName.trim() || newName === treatmentName) {
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('treatments')
        .update({ treatment_name: newName.trim() })
        .eq('id', treatmentId);

      if (error) throw error;

      setTreatmentName(newName.trim());
      toast({
        title: 'Success',
        description: 'Treatment name updated successfully',
      });
      return true;
    } catch (error) {
      console.error('Failed to update treatment name:', error);
      toast({
        title: 'Error',
        description: 'Failed to update treatment name',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    treatmentName,
    setTreatmentName,
    updateTreatmentName,
    isLoading,
  };
};
