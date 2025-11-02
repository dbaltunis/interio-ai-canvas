
import { useToast, toast } from "@/hooks/use-toast";

// Helper function to show success toast (only for important events)
export const showSuccessToast = (title: string, description?: string, importance: 'silent' | 'normal' | 'important' = 'normal') => {
  toast({
    title,
    description,
    variant: "success",
    importance,
  });
};

// Helper function to show error toast (always important)
export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "destructive",
    importance: 'important',
  });
};

export { useToast, toast };
