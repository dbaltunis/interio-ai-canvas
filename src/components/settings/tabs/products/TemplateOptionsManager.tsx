import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { singularToDbValue } from "@/types/treatmentCategories";

interface TemplateOptionsManagerProps {
  curtainType: string;
}

export const TemplateOptionsManager = ({ curtainType }: TemplateOptionsManagerProps) => {
  const navigate = useNavigate();
  
  // Convert singular curtain_type to plural treatment_category for display
  const treatmentCategory = singularToDbValue(curtainType);

  // Map curtain types to option management paths
  const getOptionsPath = () => {
    // Navigate to System Settings Options tab with the treatment type pre-selected
    return `/settings?tab=system&subtab=options&treatment=${treatmentCategory}`;
  };

  const getOptionsDescription = () => {
    switch (curtainType) {
      case 'roller_blind':
        return 'Control Types, Fascia Types, Mount Types, Tube Sizes, Bottom Rails, Motor Types';
      case 'roman_blind':
        return 'Mount Types, Lift Systems, Chain Options, Valance Options';
      case 'curtain':
        return 'Heading Styles (managed in Headings section)';
      case 'venetian_blind':
      case 'vertical_blind':
        return 'Slat/Vane Types, Control Types, Mount Types, Tilt Options';
      case 'cellular_blind':
        return 'Cell Sizes, Control Types, Mount Types, Lift Systems';
      default:
        return 'Product-specific options';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Options for this treatment type</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {getOptionsDescription()}
          </p>
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
