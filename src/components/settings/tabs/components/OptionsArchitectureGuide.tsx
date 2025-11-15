import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Layers, Sliders, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Comprehensive guide explaining the Options Architecture
 * This helps users understand where options come from in templates
 */
export const OptionsArchitectureGuide = () => {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <CardTitle>Understanding Window Covering Options</CardTitle>
        </div>
        <CardDescription>
          How headings, options, and templates work together
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section 1: Headings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-lg">1. Headings Section</h3>
          </div>
          <div className="pl-6 space-y-2 text-sm">
            <Alert>
              <AlertDescription>
                <strong>Purpose:</strong> Manage actual inventory items (curtain heading types) with:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Pricing per linear meter</li>
                  <li>Fullness ratios (e.g., 2x, 2.5x, 3x)</li>
                  <li>Images and descriptions</li>
                  <li>Manufacturing specifications</li>
                </ul>
              </AlertDescription>
            </Alert>
            <p className="text-muted-foreground">
              <strong>Examples:</strong> Pencil Pleat (2.5x fullness), Eyelet (2x fullness), Wave Heading (2.5x fullness)
            </p>
            <p className="text-xs text-primary font-medium">
              ✅ Used in: Template Editor → Heading Tab (select which headings this template supports)
            </p>
          </div>
        </div>

        {/* Section 2: Options Tab - For Simple Options */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-lg">2. Options Tab - Simple Configuration</h3>
          </div>
          <div className="pl-6 space-y-3 text-sm">
            <Alert>
              <AlertDescription>
                <strong>Purpose:</strong> Create simple, flat options that apply across ALL templates:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Lining Options:</strong> Standard, Blackout, Thermal</li>
                  <li><strong>Mount Types:</strong> Inside Mount, Outside Mount, Ceiling Mount</li>
                  <li><strong>Simple Hardware:</strong> Single-choice items with no nested configurations</li>
                  <li>Each option can have pricing (fixed, per-unit, or pricing grid)</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <p className="text-xs text-primary font-medium">
              ✅ Use when: Options don't need sub-choices or nested configurations
            </p>
          </div>
        </div>

        {/* Section 3: Hardware Tab - Hierarchical Structure */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-lg">3. Hardware Tab - Hierarchical Configuration</h3>
          </div>
          <div className="pl-6 space-y-3 text-sm">
            <Alert>
              <AlertDescription>
                <strong>Purpose:</strong> Create complex hardware configurations with a 4-level hierarchy:
                <div className="mt-3 space-y-2 pl-3 border-l-2 border-primary/30">
                  <div>
                    <strong className="text-primary">Level 1: Category</strong> (e.g., "Hardware Options")
                    <div className="pl-4 mt-1 text-muted-foreground">
                      → <strong className="text-primary">Level 2: Subcategory</strong> (e.g., "Motorised", "Regular/Manual")
                      <div className="pl-4 mt-1">
                        → <strong className="text-primary">Level 3: Type</strong> (e.g., "Rods", "Tracks")
                        <div className="pl-4 mt-1">
                          → <strong className="text-primary">Level 4: Extras</strong> (e.g., specific models, colors, finials, brackets)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium mb-2">Example: Complete Hardware Flow</p>
              <div className="space-y-1 text-xs pl-2 border-l-2 border-primary/30">
                <div><strong>1. Category:</strong> Hardware Options</div>
                <div className="pl-3">
                  <strong>→ 2. Subcategory:</strong> Motorised
                  <div className="pl-3">
                    <strong>→ 3. Type:</strong> Tracks
                    <div className="pl-3">
                      <strong>→ 4. Extras:</strong> Track Model (from inventory), White Color (+$0), Standard Motor (+$250), Left Side Motor, Remote Control (+$50)
                    </div>
                  </div>
                </div>
                <div className="pl-3 mt-2">
                  <strong>→ 2. Subcategory:</strong> Regular (Manual)
                  <div className="pl-3">
                    <strong>→ 3. Type:</strong> Rods
                    <div className="pl-3">
                      <strong>→ 4. Extras:</strong> Rod Model (from inventory), Chrome Color (+$15), Crystal Finials (+$25), Wall Brackets (+$10)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-primary font-medium">
              ✅ Use when: Options need multiple nested choices (motorised vs manual, rods vs tracks, colors, accessories)
            </p>
          </div>
        </div>

        {/* Section 4: Template Editor */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-lg">4. Template Editor → Options Tab</h3>
          </div>
          <div className="pl-6 space-y-2 text-sm">
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                <strong>Purpose:</strong> Enable/disable which GLOBAL options appear for this specific template
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>✅ Toggle visibility of options created in Options Tab</li>
                  <li>✅ Set default selections for this template</li>
                  <li>❌ Does NOT create new option types (that's done in Options Tab)</li>
                </ul>
              </AlertDescription>
            </Alert>
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium mb-2">Example Scenario:</p>
              <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                <li>Go to Options Tab → Curtains → Create "Motorization" options</li>
                <li>Create values: "No Motor", "Battery Motor (+$150)", "Hardwired Motor (+$200)"</li>
                <li>Go to Template Editor → Select "Premium Curtain Template" → Options Tab</li>
                <li>Enable "Motorization" checkbox → Now this template shows motor options during job creation</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Key Points */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">🔑 Key Points</h3>
          <ul className="space-y-2 text-sm pl-4">
            <li className="flex gap-2">
              <span>•</span>
              <span><strong>Headings</strong> = Physical inventory items with manufacturing specs (fullness ratios, pricing)</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span><strong>Options Tab</strong> = Simple, flat hardware choices (linings, mounts, single-choice items)</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span><strong>Hardware Tab</strong> = Complex nested configurations (motorised/manual → rods/tracks → colors/accessories)</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span><strong>Template Options Tab</strong> = Enable/disable what shows for THIS specific template</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span className="text-muted-foreground">Create options once, reuse across multiple templates by toggling them on/off</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
