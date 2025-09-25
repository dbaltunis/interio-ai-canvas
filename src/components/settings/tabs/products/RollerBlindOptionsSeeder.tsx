import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateRollerBlindOptions } from "@/hooks/useRollerBlindOptionsSeeder";
import { useOptionCategories } from "@/hooks/useOptionCategories";

export const RollerBlindOptionsSeeder = () => {
  const { mutate: createRollerBlindOptions, isPending } = useCreateRollerBlindOptions();
  const { data: existingCategories } = useOptionCategories("roller_blind");

  const hasExistingRollerBlindOptions = existingCategories && existingCategories.length > 0;

  const handleCreateOptions = () => {
    createRollerBlindOptions();
  };

  if (hasExistingRollerBlindOptions) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Roller Blind Options</CardTitle>
          <CardDescription>
            You already have {existingCategories.length} roller blind option categories configured.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-sm">Quick Setup: Roller Blind Options</CardTitle>
        <CardDescription>
          Create a complete set of roller blind option categories with standard configurations including operation systems, chain options, colors, and finishing details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            This will create 12 option categories with subcategories for:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Treatment Configuration (Single/Double)</li>
              <li>Operation System (Manual/Motorized)</li>
              <li>Roll Direction & Chain Configuration</li>
              <li>Fascia, Colors & Bottom Rail Options</li>
            </ul>
          </div>
          <Button 
            onClick={handleCreateOptions}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Creating Options..." : "Create Roller Blind Options"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};