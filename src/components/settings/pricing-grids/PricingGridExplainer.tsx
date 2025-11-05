import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const PricingGridExplainer = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          How Pricing Grids Work
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Understanding Pricing Grids</DialogTitle>
          <DialogDescription>
            There are two different pricing grid systems in your application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* System Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Global System */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default">Recommended</Badge>
                <h3 className="font-semibold">Global Pricing Grids</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced system with routing rules
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>One grid for multiple products</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Automatic routing based on fabric group</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Centralized management</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Easy updates (change once, applies everywhere)</span>
                </div>
              </div>
            </div>

            {/* Inline System */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Legacy</Badge>
                <h3 className="font-semibold">Inline Pricing Grids</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Simple direct upload to template
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Upload CSV directly in template</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>One grid per template only</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Simpler for single-product pricing</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">⚠</span>
                  <span>Must update each template separately</span>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use Global System */}
          <Alert>
            <AlertDescription>
              <h4 className="font-semibold mb-2">How to Use Global Pricing Grids (Recommended)</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  <strong>Settings → Pricing Grids</strong> - Upload your CSV files and create grids
                  <div className="ml-6 text-muted-foreground">
                    Example: "Roller Blind Group A", "Roller Blind Group B"
                  </div>
                </li>
                <li>
                  <strong>Create Routing Rules</strong> - Tell the system which grid to use when
                  <div className="ml-6 text-muted-foreground">
                    Example: "Use Grid A for roller_blinds + cassette system + Group A fabrics"
                  </div>
                </li>
                <li>
                  <strong>Configure Templates</strong> - Set pricing_type to "pricing_grid"
                  <div className="ml-6 text-muted-foreground">
                    Add system_type and price_group fields to your template
                  </div>
                </li>
                <li>
                  <strong>Automatic Resolution</strong> - System finds the right grid automatically
                  <div className="ml-6 text-muted-foreground">
                    Based on product type + system + fabric price group
                  </div>
                </li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Example Scenario */}
          <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
            <h4 className="font-semibold">Example Scenario</h4>
            <div className="space-y-2 text-sm">
              <p><strong>You sell:</strong> Roller blinds with different systems (Open, Cassette, Heavy Duty)</p>
              <p><strong>You have:</strong> 4 fabric price groups (A, B, C, D)</p>
              
              <div className="mt-3 p-3 bg-background rounded border">
                <p className="font-medium mb-2">Global System Approach:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Create 4 grids: "Roller A", "Roller B", "Roller C", "Roller D"</li>
                  <li>Create rules: roller_blinds + Group A → Grid A, etc.</li>
                  <li>All roller templates use pricing_type: "pricing_grid"</li>
                  <li>System auto-selects correct grid based on fabric chosen</li>
                </ul>
              </div>

              <div className="mt-3 p-3 bg-background rounded border">
                <p className="font-medium mb-2">Inline System Approach:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Upload grid directly in each template</li>
                  <li>One grid per template (can't vary by fabric group)</li>
                  <li>To update prices: edit each template individually</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Which to Use */}
          <Alert className="border-blue-500">
            <AlertDescription>
              <h4 className="font-semibold mb-2">Which Should You Use?</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Use Global Pricing Grids if:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>You have multiple fabric price groups</li>
                  <li>You have multiple system types (cassette, open, etc.)</li>
                  <li>You want centralized price management</li>
                  <li>You need to update prices across multiple products easily</li>
                </ul>

                <p className="mt-3"><strong>Use Inline Pricing Grid if:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>You have a single, unique product</li>
                  <li>Pricing doesn't vary by fabric group or system</li>
                  <li>You want the simplest possible setup</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Where to Find */}
          <div className="border rounded-lg p-4 space-y-2">
            <h4 className="font-semibold">Where to Find Each System</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Global Pricing Grids</span>
                <Badge variant="outline">Settings → Pricing Grids</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Inline Template Grid</span>
                <Badge variant="outline">Template Editor → Pricing Section</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Window Covering Grid</span>
                <Badge variant="outline">Window Covering Form → Pricing Method</Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
