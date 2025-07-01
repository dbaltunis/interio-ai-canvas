
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyOptionsStateProps {
  onBack: () => void;
}

export const EmptyOptionsState = ({ onBack }: EmptyOptionsStateProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No Option Categories Found</CardTitle>
        <CardDescription>
          You need to create option categories first before you can assign them to window coverings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-brand-neutral mb-4">
          Go to Settings → Products → Window Coverings → Option Categories to create your first category.
        </p>
        <Button 
          onClick={onBack}
          className="bg-brand-primary hover:bg-brand-accent"
        >
          Go to Category Management
        </Button>
      </CardContent>
    </Card>
  );
};
