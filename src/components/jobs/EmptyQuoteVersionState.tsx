import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, PackageOpen, Plus } from "lucide-react";

interface EmptyQuoteVersionStateProps {
  currentVersion: number;
  onCopyFromVersion?: () => void;
  onAddRoom?: () => void;
}

export const EmptyQuoteVersionState = ({ 
  currentVersion, 
  onCopyFromVersion,
  onAddRoom
}: EmptyQuoteVersionStateProps) => {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <PackageOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          Quote Version {currentVersion} is Empty
        </h3>
        
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          This quote version doesn't have any rooms or treatments yet. Start by adding a room or copy from another version.
        </p>
        
        <div className="flex items-center gap-3">
          {onAddRoom && (
            <Button onClick={onAddRoom} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          )}
          {onCopyFromVersion && (
            <Button onClick={onCopyFromVersion} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy from Another Version
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
