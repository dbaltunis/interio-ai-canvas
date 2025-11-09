import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductTableToolProps {
  onAddProductTable: () => void;
}

export const ProductTableTool = ({ onAddProductTable }: ProductTableToolProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Table className="h-4 w-4 text-primary" />
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Product Table
        </Label>
      </div>
      
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground mb-3">
          Add a dynamic table that will automatically populate with quote line items when generating the final document.
        </p>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full hover:bg-primary/10 hover:border-primary/50"
          onClick={onAddProductTable}
        >
          <Table className="h-4 w-4 mr-2" />
          Add Product Table
        </Button>
        
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs font-medium text-foreground mb-2">Table will include:</p>
          <div className="space-y-1">
            {['Item Name & Description', 'Quantity', 'Unit Price', 'Line Total'].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">✓</Badge>
                <span className="text-xs text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
