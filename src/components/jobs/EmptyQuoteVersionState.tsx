import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, PackageOpen } from "lucide-react";

interface EmptyQuoteVersionStateProps {
  currentVersion: number;
  onCopyFromVersion?: () => void;
}

export const EmptyQuoteVersionState = ({ 
  currentVersion, 
  onCopyFromVersion 
}: EmptyQuoteVersionStateProps) => {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <PackageOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          Version {currentVersion} is Empty
        </h3>
        
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          This quote version doesn't have any rooms or treatments yet. You can copy content from another version or start adding rooms.
        </p>
        
        {onCopyFromVersion && (
          <Button onClick={onCopyFromVersion} variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy from Another Version
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
