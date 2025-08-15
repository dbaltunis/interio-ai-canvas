import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useWindowCoverings, type WindowCovering } from "@/hooks/useWindowCoverings";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WindowCoveringSelectorProps {
  selectedCoveringId?: string;
  onCoveringSelect: (covering: WindowCovering | null) => void;
  disabled?: boolean;
}

export const WindowCoveringSelector = ({
  selectedCoveringId,
  onCoveringSelect,
  disabled
}: WindowCoveringSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: windowCoverings = [], isLoading } = useWindowCoverings();

  const selectedCovering = windowCoverings.find(c => c.id === selectedCoveringId);

  const filteredCoverings = windowCoverings.filter(covering =>
    covering.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    covering.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (covering.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedCoverings = filteredCoverings.reduce((acc, covering) => {
    const category = covering.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(covering);
    return acc;
  }, {} as Record<string, WindowCovering[]>);

  const handleCoveringSelect = (covering: WindowCovering) => {
    onCoveringSelect(covering);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleRemoveCovering = () => {
    onCoveringSelect(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full justify-start gap-2"
        >
          <Layers className="h-4 w-4" />
          {selectedCovering ? (
            <div className="flex items-center gap-2 flex-1 text-left">
              <span className="font-medium">{selectedCovering.name}</span>
              <Badge variant="secondary" className="text-xs">
                {selectedCovering.category}
              </Badge>
            </div>
          ) : (
            <span className="text-muted-foreground">Select Window Covering</span>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Select Window Covering
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search window coverings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {selectedCovering && (
              <Button
                variant="outline"
                onClick={handleRemoveCovering}
                className="text-destructive hover:text-destructive"
              >
                Remove Selection
              </Button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading window coverings...</div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredCoverings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No window coverings found</h3>
              <p className="text-muted-foreground max-w-md">
                {searchQuery 
                  ? "Try adjusting your search criteria"
                  : "Create window coverings in Settings to get started"
                }
              </p>
            </div>
          )}

          {/* Window Coverings List */}
          {!isLoading && filteredCoverings.length > 0 && (
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-6">
                {Object.entries(groupedCoverings).map(([category, coverings]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b pb-2">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {coverings.map((covering) => (
                        <Card
                          key={covering.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedCoveringId === covering.id
                              ? "ring-2 ring-primary bg-primary/5"
                              : "hover:bg-accent/50"
                          }`}
                          onClick={() => handleCoveringSelect(covering)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base font-medium">
                                {covering.name}
                              </CardTitle>
                              {covering.base_price && (
                                <Badge variant="outline" className="text-xs">
                                  £{covering.base_price.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                            {covering.description && (
                              <CardDescription className="text-sm line-clamp-2">
                                {covering.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          {(covering.category || covering.created_at) && (
                            <CardContent className="pt-0">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="secondary" className="text-xs">
                                  {covering.category}
                                </Badge>
                                <span>•</span>
                                <span>
                                  Created {new Date(covering.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};