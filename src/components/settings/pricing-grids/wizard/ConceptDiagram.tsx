import { Card } from '@/components/ui/card';
import { ArrowRight, Package, Settings, Tag, Grid3x3 } from 'lucide-react';

export const ConceptDiagram = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">How Pricing Works</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Instead of setting prices on each individual fabric, we use <strong>Price Lists (Grids)</strong> 
          that apply to combinations of product types, systems, and fabric price groups.
        </p>
      </div>

      {/* Visual Flow */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-4 items-center">
          {/* Product Type */}
          <Card className="p-6 text-center border-2 hover:border-primary/50 transition-colors">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold mb-1">Product Type</h4>
            <p className="text-xs text-muted-foreground">Roller, Venetian, Roman...</p>
            <div className="mt-3 space-y-1">
              <div className="text-xs bg-muted px-2 py-1 rounded">Roller Blinds</div>
            </div>
          </Card>

          <ArrowRight className="h-6 w-6 text-primary mx-auto" />

          {/* System Type */}
          <Card className="p-6 text-center border-2 hover:border-primary/50 transition-colors">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold mb-1">System Type</h4>
            <p className="text-xs text-muted-foreground">Cassette, Open, Chain...</p>
            <div className="mt-3 space-y-1">
              <div className="text-xs bg-muted px-2 py-1 rounded">Cassette</div>
            </div>
          </Card>

          <ArrowRight className="h-6 w-6 text-primary mx-auto" />

          {/* Price Group */}
          <Card className="p-6 text-center border-2 hover:border-primary/50 transition-colors">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold mb-1">Fabric Group</h4>
            <p className="text-xs text-muted-foreground">A, B, C, Premium...</p>
            <div className="mt-3 space-y-1">
              <div className="text-xs bg-muted px-2 py-1 rounded">Group A</div>
            </div>
          </Card>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center my-6">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-12 bg-primary"></div>
            <ArrowRight className="h-6 w-6 text-primary rotate-90" />
          </div>
        </div>

        {/* Result */}
        <Card className="p-8 text-center border-2 border-primary bg-primary/5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
            <Grid3x3 className="h-8 w-8 text-primary" />
          </div>
          <h4 className="text-lg font-semibold mb-2">Price List (Grid)</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Contains prices for different width × height combinations
          </p>
          <div className="inline-block bg-background px-4 py-2 rounded-lg border text-sm">
            <strong>ROLLER_CASSETTE_A</strong>
          </div>
        </Card>
      </div>

      {/* Example */}
      <div className="bg-muted/30 border border-muted rounded-lg p-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">!</span>
          Real Example
        </h4>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Scenario:</strong> Customer wants a Roller Blind with Cassette system using a Group A fabric
          </p>
          <p className="text-muted-foreground">
            → System looks up: <span className="font-mono bg-background px-2 py-0.5 rounded">Roller + Cassette + Group A</span>
          </p>
          <p className="text-muted-foreground">
            → Finds grid: <span className="font-mono bg-background px-2 py-0.5 rounded">ROLLER_CASSETTE_A</span>
          </p>
          <p className="text-muted-foreground">
            → Uses that grid to get price for 150cm × 200cm
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-green-500/5 border-green-500/20">
          <h5 className="font-semibold text-sm mb-1">✓ Easy Maintenance</h5>
          <p className="text-xs text-muted-foreground">Update one grid instead of hundreds of fabrics</p>
        </Card>
        <Card className="p-4 bg-blue-500/5 border-blue-500/20">
          <h5 className="font-semibold text-sm mb-1">✓ Flexible</h5>
          <p className="text-xs text-muted-foreground">Different prices for different systems</p>
        </Card>
        <Card className="p-4 bg-purple-500/5 border-purple-500/20">
          <h5 className="font-semibold text-sm mb-1">✓ Scalable</h5>
          <p className="text-xs text-muted-foreground">Add new products easily</p>
        </Card>
      </div>
    </div>
  );
};
