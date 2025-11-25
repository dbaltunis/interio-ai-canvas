import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { singularToDbValue } from "@/types/treatmentCategories";
import { useOptionTypeCategories } from "@/hooks/useOptionTypeCategories";

interface TemplateOptionsManagerProps {
  curtainType: string;
}

export const TemplateOptionsManager = ({ curtainType }: TemplateOptionsManagerProps) => {
  const navigate = useNavigate();
  
  // Convert singular curtain_type to plural treatment_category for display
  const treatmentCategory = singularToDbValue(curtainType);

  // Fetch actual option types from database
  const { data: optionTypes, isLoading } = useOptionTypeCategories(treatmentCategory);

  // Map curtain types to option management paths
  const getOptionsPath = () => {
    return `/settings?tab=system&subtab=options&treatment=${treatmentCategory}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Options for this treatment type</Label>
          {isLoading ? (
            <p className="text-sm text-muted-foreground mt-1">Loading options...</p>
          ) : optionTypes && optionTypes.length > 0 ? (
            <p className="text-sm text-muted-foreground mt-1">
              {optionTypes.map(opt => opt.type_label).join(', ')}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              {curtainType === 'curtain' ? 'Heading Styles (managed in Headings section)' : 'No options configured yet'}
            </p>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => navigate(getOptionsPath())}
          className="w-full"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Manage Options in System Settings
        </Button>

        <p className="text-xs text-muted-foreground">
          Options are configured in System Settings and automatically available for all templates of this type. Your account options are isolated from other accounts.
        </p>
      </CardContent>
    </Card>
  );
};
