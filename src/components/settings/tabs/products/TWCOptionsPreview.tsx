import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Package } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TWCQuestion {
  name: string;
  options: string[];
  isRequired: boolean;
}

interface TWCOptionsPreviewProps {
  twcQuestions: TWCQuestion[];
  productName?: string;
  itemNumber?: string;
}

export const TWCOptionsPreview = ({ twcQuestions, productName, itemNumber }: TWCOptionsPreviewProps) => {
  if (!twcQuestions || twcQuestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-base">TWC Product Options</CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {twcQuestions.length} options
          </Badge>
        </div>
        {(productName || itemNumber) && (
          <p className="text-sm text-muted-foreground">
            Linked to: {productName} {itemNumber && <span className="text-xs">({itemNumber})</span>}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {twcQuestions.map((question, index) => (
            <div key={index} className="border rounded-lg p-3 bg-background">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{question.name}</span>
                {question.isRequired && (
                  <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {question.options.slice(0, 10).map((option, optIndex) => (
                  <Badge 
                    key={optIndex} 
                    variant="outline" 
                    className="text-xs bg-white dark:bg-muted"
                  >
                    {option}
                  </Badge>
                ))}
                {question.options.length > 10 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{question.options.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <Alert className="bg-blue-100/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
            These options come from TWC's catalog and will appear when creating orders. 
            Use "Re-sync Options" in the TWC section to import them as selectable treatment options.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
