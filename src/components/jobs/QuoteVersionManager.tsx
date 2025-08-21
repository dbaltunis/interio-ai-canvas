import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Settings, 
  Save, 
  X, 
  Eye,
  Copy,
  Send,
  Plus
} from "lucide-react";
import { useProject } from "@/hooks/useProjects";
import { useRooms } from "@/hooks/useRooms";
import { useTreatments } from "@/hooks/useTreatments";
import { useInventory } from "@/hooks/useInventory";
import { useQuoteVersions } from "@/hooks/useQuoteVersions";

interface QuoteVersionManagerProps {
  projectId: string;
  quoteData?: any;
  onSave: (quoteConfig: any) => void;
  onCancel: () => void;
  onPreview: () => void;
}

export const QuoteVersionManager = ({ 
  projectId, 
  quoteData, 
  onSave, 
  onCancel, 
  onPreview 
}: QuoteVersionManagerProps) => {
  const { data: project } = useProject(projectId);
  const { data: rooms = [] } = useRooms(projectId);
  const { data: treatments = [] } = useTreatments(projectId);
  const { data: inventoryItems = [] } = useInventory();
  const { duplicateQuote } = useQuoteVersions(projectId);

  const [quoteConfig, setQuoteConfig] = useState({
    name: quoteData?.name || `Quote Version ${Date.now()}`,
    description: quoteData?.description || '',
    includedRooms: quoteData?.includedRooms || rooms.map(r => r.id),
    treatmentOverrides: quoteData?.treatmentOverrides || {},
    markupPercentage: quoteData?.markupPercentage || 20,
    taxRate: quoteData?.taxRate || 10,
    validUntil: quoteData?.validUntil || '',
  });

  const handleRoomToggle = (roomId: string, included: boolean) => {
    setQuoteConfig(prev => ({
      ...prev,
      includedRooms: included 
        ? [...prev.includedRooms, roomId]
        : prev.includedRooms.filter(id => id !== roomId)
    }));
  };

  const handleFabricChange = (treatmentId: string, fabricId: string) => {
    setQuoteConfig(prev => ({
      ...prev,
      treatmentOverrides: {
        ...prev.treatmentOverrides,
        [treatmentId]: {
          ...prev.treatmentOverrides[treatmentId],
          fabricId
        }
      }
    }));
  };

  const getRoomTreatments = (roomId: string) => {
    return treatments.filter(t => t.room_id === roomId);
  };

  const getFabricItems = () => {
    return inventoryItems.filter(item => item.category === 'fabric');
  };

  const getCurrentFabric = (treatmentId: string) => {
    const override = quoteConfig.treatmentOverrides[treatmentId];
    if (override?.fabricId) {
      return inventoryItems.find(item => item.id === override.fabricId);
    }
    
    const treatment = treatments.find(t => t.id === treatmentId);
    return inventoryItems.find(item => item.id === treatment?.fabric_type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Quote Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quote-name">Quote Name</Label>
              <Input
                id="quote-name"
                value={quoteConfig.name}
                onChange={(e) => setQuoteConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Main Quote, Budget Option, etc."
              />
            </div>
            <div>
              <Label htmlFor="valid-until">Valid Until</Label>
              <Input
                id="valid-until"
                type="date"
                value={quoteConfig.validUntil}
                onChange={(e) => setQuoteConfig(prev => ({ ...prev, validUntil: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={quoteConfig.description}
              onChange={(e) => setQuoteConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description for this quote version"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="markup">Markup Percentage</Label>
              <Input
                id="markup"
                type="number"
                value={quoteConfig.markupPercentage}
                onChange={(e) => setQuoteConfig(prev => ({ ...prev, markupPercentage: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="tax">Tax Rate (%)</Label>
              <Input
                id="tax"
                type="number"
                value={quoteConfig.taxRate}
                onChange={(e) => setQuoteConfig(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Rooms & Treatments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rooms.map((room) => {
              const isIncluded = quoteConfig.includedRooms.includes(room.id);
              const roomTreatments = getRoomTreatments(room.id);
              
              return (
                <div 
                  key={room.id} 
                  className={`border rounded-lg p-4 transition-all ${
                    isIncluded ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={isIncluded}
                        onCheckedChange={(checked) => handleRoomToggle(room.id, checked)}
                      />
                      <div>
                        <h4 className="font-medium">{room.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {roomTreatments.length} treatment{roomTreatments.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isIncluded ? "default" : "outline"}>
                      {isIncluded ? "Included" : "Excluded"}
                    </Badge>
                  </div>

                  {isIncluded && roomTreatments.length > 0 && (
                    <div className="space-y-3 pl-8">
                      {roomTreatments.map((treatment) => {
                        const currentFabric = getCurrentFabric(treatment.id);
                        const fabricItems = getFabricItems();
                        
                        return (
                          <div key={treatment.id} className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-medium">Treatment {treatment.id.slice(-4)}</span>
                                <p className="text-xs text-muted-foreground">
                                  {treatment.fabric_type || 'Window Treatment'}
                                </p>
                              </div>
                            
                            <div className="flex items-center space-x-2">
                              <Label className="text-xs">Fabric:</Label>
                              <Select
                                value={currentFabric?.id || ''}
                                onValueChange={(value) => handleFabricChange(treatment.id, value)}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Select fabric">
                                    {currentFabric?.name || 'No fabric selected'}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {fabricItems.map((fabric) => (
                                    <SelectItem key={fabric.id} value={fabric.id}>
                                      <div className="flex items-center justify-between w-full">
                                        <span>{fabric.name}</span>
                                         <span className="text-xs text-muted-foreground ml-2">
                                           ${fabric.unit_price}/unit
                                         </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          
          <Button 
            onClick={() => {
              // TODO: Implement quote version creation
              console.log('Creating quote version:', quoteConfig);
              onSave(quoteConfig);
            }}
            disabled={duplicateQuote.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {duplicateQuote.isPending ? 'Creating...' : 'Save Quote Version'}
          </Button>
        </div>
      </div>
    </div>
  );
};