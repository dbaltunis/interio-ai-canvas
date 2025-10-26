import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCreateQuote } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";

interface NewQuoteButtonProps {
  projectId: string;
}

export const NewQuoteButton = ({ projectId }: NewQuoteButtonProps) => {
  const createQuote = useCreateQuote();
  const { toast } = useToast();

  const handleCreateQuote = async () => {
    try {
      const newQuote = await createQuote.mutateAsync({
        project_id: projectId,
        status: "draft",
        notes: "New quote created for project"
      });
    } catch (error) {
      console.error("Error creating quote:", error);
      toast({
        title: "Error",
        description: "Failed to create quote. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button 
      onClick={handleCreateQuote} 
      disabled={createQuote.isPending}
      size="sm"
    >
      <Plus className="h-4 w-4 mr-2" />
      {createQuote.isPending ? "Creating..." : "New Quote"}
    </Button>
  );
};