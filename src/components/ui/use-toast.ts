
import { useToast, toast } from "@/hooks/use-toast";

// Helper function to show success toast
export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "success",
  });
};

// Helper function to show error toast
export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "destructive",
  });
};

export { useToast, toast };
